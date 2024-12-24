import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Embeddings, WithXHeaders } from '../interfaces';

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

function buildResponse(response: AxiosResponse): Embeddings & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as Embeddings);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function post_embeddings(
  client: AxiosInstance,
  args: GetEmbeddingsArgs,
): Promise<Embeddings & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
