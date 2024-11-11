import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Chat } from '../interfaces/chat';
import { ChatCompletion } from '../interfaces/chat_completion';

interface GetChatArgs {
  chat: Chat;
  accessToken?: string;
}

function getRequestConfig({ chat, accessToken }: GetChatArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'POST',
    url: '/chat/completions',
    data: chat,
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): ChatCompletion {
  if (response.status === 200) {
    return response.data as ChatCompletion;
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

export async function post_chat(client: AxiosInstance, args: GetChatArgs): Promise<ChatCompletion> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
