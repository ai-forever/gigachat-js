import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, parseChunk } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Chat, ChatCompletionChunk } from '../interfaces';
import { Readable } from 'stream';

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
    responseType: 'stream',
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
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

function splitLines(data: string): string[] {
  return data.split(/\r?\n/).filter((line) => line.trim() !== '');
}

export async function stream_chat(client: AxiosInstance, args: GetChatStreamArgs): Promise<Readable> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  checkResponse(response);
  const stream = new Readable({
    objectMode: true,
    read() {},
  });

  response.data.on('data', (data: Buffer) => {
    const lines = splitLines(data.toString());
    lines.forEach((line) => {
      const chunk = parseChunk<ChatCompletionChunk>(line);
      if (chunk) {
        stream.push(chunk);
      }
    });
  });
  response.data.on('end', () => {
    stream.push(null);
  });
  response.data.on('error', (error: any) => {
    stream.destroy(error);
  });
  return stream;
}
