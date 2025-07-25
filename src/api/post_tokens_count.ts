import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Tokens, WithXHeaders } from '../interfaces';

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

function buildResponse(response: AxiosResponse): Tokens & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, { tokens: response.data } as Tokens);
  } else if (response.status === 401) {
    throw new AuthenticationError(response);
  } else {
    throw new ResponseError(response);
  }
}

export async function post_tokens_count(
  client: AxiosInstance,
  args: GetTokensCountArgs,
): Promise<Tokens & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
