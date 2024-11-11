import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Token } from '../interfaces/token';

interface TokenArgs {
  user: string;
  password: string;
}

function getRequestConfig(args: TokenArgs): AxiosRequestConfig {
  const headers = buildHeaders();

  return {
    method: 'POST',
    url: '/token',
    auth: {
      username: args.user,
      password: args.password,
    },
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): Token {
  if (response.status === 200) {
    return response.data as Token;
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

export async function post_token(client: AxiosInstance, args: TokenArgs): Promise<Token> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
