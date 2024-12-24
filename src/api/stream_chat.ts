import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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
): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);
  if (!isBrowser) {
    headers['Accept'] = EVENT_STREAM;
    headers['Cache-Control'] = 'no-store';
  }
  if (isBrowser) {
    delete headers['User-Agent'];
  }

  const config = {
    method: 'POST',
    url: '/chat/completions',
    responseType: 'stream',
    data: { ...chat, ...{ stream: true } },
    headers: headers,
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
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

function splitLines(data: string): string[] {
  return data.split(/\r?\n/).filter((line) => line.trim() !== '');
}

export async function stream_chat(
  client: AxiosInstance,
  args: GetChatStreamArgs,
  isBrowser: boolean = false,
): Promise<any> {
  let done = false;
  const pushQueue: ChatCompletionChunk[] = [];
  const readQueue: {
    resolve: (chunk: ChatCompletionChunk | undefined) => void;
    reject: (err: unknown) => void;
  }[] = [];
  const readable = await stream_chat_readable(client, args, isBrowser);
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
): Promise<EventEmitter> {
  const config = getRequestConfig(args, isBrowser);
  const emitter = new EventEmitter();

  const response = await client.request(config);
  checkResponse(response);

  if (isBrowser) {
    const reader = response.data.getReader();
    reader.read().then(function pump({ done, value }: { done: boolean; value: Uint8Array }) {
      if (done) {
        emitter.emit('end');
        return;
      } else {
        const chunk = new TextDecoder().decode(value);
        const lines = splitLines(chunk.toString());
        lines.forEach((line) => {
          const chatChunk = parseChunk(line);
          if (chatChunk) {
            emitter.emit('chunk', buildXHeaders(response, chatChunk as ChatCompletionChunk)); // Отправка события с новым чанком
          }
        });
      }
      return reader.read().then(pump);
    });
  } else {
    response.data.on('data', (chunk: Buffer) => {
      const lines = splitLines(chunk.toString());
      lines.forEach((line) => {
        const chatChunk = parseChunk(line);
        if (chatChunk) {
          emitter.emit('chunk', buildXHeaders(response, chatChunk as ChatCompletionChunk)); // Отправка события с новым чанком
        }
      });
    });
    response.data.on('end', () => {
      emitter.emit('end'); // Отправка события завершения
    });
    response.data.on('error', (error: any) => {
      emitter.emit('error', error); // Отправка события ошибки
    });
  }

  return emitter;
}
