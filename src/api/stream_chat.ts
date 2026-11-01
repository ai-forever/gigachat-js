import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders, parseChunk } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Chat, ChatCompletionChunk } from '../interfaces';
import { EventEmitter } from 'events';

const EVENT_STREAM = 'text/event-stream';

interface GetChatStreamArgs {
  chat: Chat;
  accessToken?: string;
}

function getRequestConfig(
  { chat, accessToken }: GetChatStreamArgs,
  isBrowser: boolean = false,
  abortSignal?: AbortSignal,
): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);
  if (!isBrowser) {
    headers['Accept'] = EVENT_STREAM;
    headers['Cache-Control'] = 'no-store';
  }

  const config = {
    method: 'POST',
    url: '/chat/completions',
    responseType: 'stream',
    data: { ...chat, ...{ stream: true } },
    headers: headers,
    signal: abortSignal,
  } as AxiosRequestConfig;
  if (isBrowser) {
    config.adapter = 'fetch';
  }

  return config;
}

function checkContentType(response: AxiosResponse): void {
  const contentType = response.headers['content-type']?.split(';')[0];
  if (contentType !== EVENT_STREAM) {
    throw new Error(`Expected response Content-Type to be '${EVENT_STREAM}', got '${contentType}'`);
  }
}

function checkResponse(response: AxiosResponse): void {
  if (response.status === 200) {
    checkContentType(response);
  } else if (response.status === 401) {
    throw new AuthenticationError(response);
  } else {
    throw new ResponseError(response);
  }
}

// Buffers a streaming UTF-8 text payload and yields complete lines. SSE
// frames are delimited by '\n' (or '\r\n'), but TCP can deliver a single SSE
// event across multiple `data` events — splitting mid-string inside a JSON
// payload. A naive split-per-chunk feeds truncated lines to JSON.parse and
// throws `SyntaxError: Unterminated string in JSON` synchronously inside the
// 'data' handler, which surfaces as an uncaughtException and can crash the
// host process.
function createLineBuffer() {
  let buffer = '';
  return {
    push(chunk: string): string[] {
      buffer += chunk;
      const parts = buffer.split(/\r?\n/);
      // The last element is either '' (chunk ended on a newline) or a
      // partial trailing line — keep it for the next chunk.
      buffer = parts.pop() ?? '';
      return parts.filter((line) => line.trim() !== '');
    },
    flush(): string[] {
      const remainder = buffer;
      buffer = '';
      return remainder.trim() !== '' ? [remainder] : [];
    },
  };
}

export async function stream_chat(
  client: AxiosInstance,
  args: GetChatStreamArgs,
  isBrowser: boolean = false,
  abortSignal?: AbortSignal,
): Promise<any> {
  let done = false;
  const pushQueue: ChatCompletionChunk[] = [];
  const readQueue: {
    resolve: (chunk: ChatCompletionChunk | undefined) => void;
    reject: (err: unknown) => void;
  }[] = [];
  const readable = await stream_chat_readable(client, args, isBrowser, abortSignal);
  function t() {
    return {
      next() {
        if (!pushQueue.length) {
          if (done) {
            return { value: undefined, done: true };
          }
          return new Promise<ChatCompletionChunk | undefined>((resolve, reject) =>
            readQueue.push({ resolve, reject }),
          ).then((chunk) => (chunk ? { value: chunk, done: false } : { value: undefined, done: true }));
        }
        const chunk = pushQueue.shift()!;
        return { value: chunk, done: false };
      },
    };
  }
  const iterable = {
    [Symbol.asyncIterator]: t,
  };
  readable.on('chunk', (chunk: any) => {
    const reader = readQueue.shift();
    if (reader) {
      reader.resolve(chunk);
    } else {
      pushQueue.push(chunk);
    }
  });
  readable.on('end', (chunk: any) => {
    done = true;
    for (const reader of readQueue) {
      reader.resolve(undefined);
    }
    readQueue.length = 0;
  });
  return iterable;
}

export async function stream_chat_readable(
  client: AxiosInstance,
  args: GetChatStreamArgs,
  isBrowser: boolean = false,
  abortSignal?: AbortSignal,
): Promise<EventEmitter> {
  const config = getRequestConfig(args, isBrowser, abortSignal);
  const emitter = new EventEmitter();

  const response = await client.request(config);
  checkResponse(response);

  const lineBuffer = createLineBuffer();

  const emitLines = (lines: string[]) => {
    lines.forEach((line) => {
      const chatChunk = parseChunk(line);
      if (chatChunk) {
        emitter.emit('chunk', buildXHeaders(response, chatChunk as ChatCompletionChunk)); // Отправка события с новым чанком
      }
    });
  };

  if (isBrowser) {
    const decoder = new TextDecoder();
    const reader = response.data.getReader();
    reader.read().then(function pump({ done, value }: { done: boolean; value: Uint8Array }) {
      if (done) {
        // Flush trailing partial line — most servers end on a blank line, but
        // be defensive in case the final SSE event is not newline-terminated.
        emitLines(lineBuffer.flush());
        emitter.emit('end');
        return;
      } else {
        // `stream: true` keeps multi-byte UTF-8 sequences split across chunks intact.
        const chunk = decoder.decode(value, { stream: true });
        emitLines(lineBuffer.push(chunk));
      }
      return reader.read().then(pump);
    });
  } else {
    response.data.on('data', (chunk: Buffer) => {
      emitLines(lineBuffer.push(chunk.toString()));
    });
    response.data.on('end', () => {
      emitLines(lineBuffer.flush());
      emitter.emit('end'); // Отправка события завершения
    });
    response.data.on('error', (error: any) => {
      if (!axios.isCancel(error)) {
        emitter.emit('error', error); // Отправка события ошибки
      }
    });
  }

  return emitter;
}
