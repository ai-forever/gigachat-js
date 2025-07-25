import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Chat } from '../interfaces/chat';
import { ChatCompletion } from 'gigachat/interfaces';
import { WithXHeaders } from 'gigachat/interfaces';

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

function buildResponse(response: AxiosResponse): ChatCompletion & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as ChatCompletion);
  } else if (response.status === 401) {
    throw new AuthenticationError(response);
  } else {
    throw new ResponseError(response);
  }
}

export async function post_chat(
  client: AxiosInstance,
  args: GetChatArgs,
): Promise<ChatCompletion & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
