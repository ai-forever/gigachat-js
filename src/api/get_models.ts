import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Models, WithXHeaders } from '../interfaces';

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

function buildResponse(response: AxiosResponse): Models & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as Models);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function get_models(client: AxiosInstance, args: GetModelsArgs): Promise<Models & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
