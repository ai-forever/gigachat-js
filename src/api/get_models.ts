import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Models } from '../interfaces';

interface GetModelsArgs {
  accessToken?: string;
}

function getRequestConfig({ accessToken }: GetModelsArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'GET',
    url: '/models',
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): Models {
  if (response.status === 200) {
    return response.data as Models;
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

export async function get_models(client: AxiosInstance, args: GetModelsArgs): Promise<Models> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
