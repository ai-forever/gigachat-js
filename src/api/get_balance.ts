import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Balance, WithXHeaders } from '../interfaces';

interface BalanceArgs {
  accessToken?: string;
}

function getRequestConfig({ accessToken }: BalanceArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'GET',
    url: '/balance',
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): Balance & WithXHeaders {
  response.headers;
  if (response.status === 200) {
    return buildXHeaders(response, response.data as Balance);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function get_balance(client: AxiosInstance, args: BalanceArgs): Promise<Balance & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
