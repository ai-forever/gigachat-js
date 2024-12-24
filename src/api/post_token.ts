import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Token } from '../interfaces/token';
import { WithXHeaders } from 'gigachat/interfaces';

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

function buildResponse(response: AxiosResponse): Token & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as Token);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function post_token(client: AxiosInstance, args: TokenArgs): Promise<Token & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
