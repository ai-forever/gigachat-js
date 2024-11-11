import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Model } from '../interfaces';

interface GetModelArgs {
  model: string;
  accessToken?: string;
}

function getRequestConfig({ model, accessToken }: GetModelArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'GET',
    url: `/models/${model}`,
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): Model {
  if (response.status === 200) {
    return response.data as Model;
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

export async function get_model(client: AxiosInstance, args: GetModelArgs): Promise<Model> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
