import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders, parseChunk } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Chat, ChatCompletionChunk, WithXHeaders } from '../interfaces';
import { EventEmitter } from 'events';

const EVENT_STREAM = 'text/event-stream';

interface GetChatStreamArgs {
  chat: Chat;
  accessToken?: string;
}

function getRequestConfig({ chat, accessToken }: GetChatStreamArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);
  headers['Accept'] = EVENT_STREAM;
  headers['Cache-Control'] = 'no-store';

  return {
    method: 'POST',
    url: '/chat/completions',
    data: { ...chat, ...{ stream: true } },
    headers: headers,
  } as AxiosRequestConfig;
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

export async function* stream_chat(
  client: AxiosInstance,
  args: GetChatStreamArgs,
): AsyncIterable<ChatCompletionChunk & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  checkResponse(response);

  for await (const chunk of response.data) {
    const lines = splitLines(chunk.toString());
    for (const line of lines) {
      const chunk = parseChunk<ChatCompletionChunk>(line);
      if (chunk) {
        yield buildXHeaders(response, chunk as ChatCompletionChunk);
      }
    }
  }
}

export async function stream_chat_readable(
  client: AxiosInstance,
  args: GetChatStreamArgs,
): Promise<EventEmitter> {
  const config = getRequestConfig(args);
  const emitter = new EventEmitter();

  const response = await client.request(config);
  checkResponse(response);

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

  return emitter;
}
