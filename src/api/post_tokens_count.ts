import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { TokensCount } from '../interfaces';

interface GetTokensCountArgs {
  input: string[];
  model: string;
  accessToken?: string;
}

function getRequestConfig({ input, model, accessToken }: GetTokensCountArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  const data = { model, input };

  return {
    method: 'POST',
    url: '/tokens/count',
    headers: headers,
    data: data,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): TokensCount[] {
  if (response.status === 200) {
    return response.data.map((row: any) => row as TokensCount);
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

export async function post_tokens_count(
  client: AxiosInstance,
  args: GetTokensCountArgs,
): Promise<TokensCount[]> {
  const config = getRequestConfig(args);
  const response = await axios.request(config);
  return buildResponse(response);
}
