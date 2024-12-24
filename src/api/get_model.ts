import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Model, WithXHeaders } from '../interfaces';

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

function buildResponse(response: AxiosResponse): Model & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as Model);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function get_model(client: AxiosInstance, args: GetModelArgs): Promise<Model & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
