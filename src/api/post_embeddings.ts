import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Embeddings } from '../interfaces';

interface GetEmbeddingsArgs {
  input: string[];
  model: string;
  accessToken?: string;
}

function getRequestConfig({ input, model, accessToken }: GetEmbeddingsArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'POST',
    url: '/embeddings',
    data: { input, model },
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): Embeddings {
  if (response.status === 200) {
    return response.data as Embeddings;
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

export async function post_embeddings(client: AxiosInstance, args: GetEmbeddingsArgs): Promise<Embeddings> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
