import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Batch, ChatCompletion, Embeddings } from '../interfaces';
import { WithXHeaders } from 'gigachat/interfaces';

interface GetBatchFileArgs {
  fileId: string;
  accessToken?: string;
}

function getRequestConfig({ fileId, accessToken }: GetBatchFileArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);
  headers['Accept'] = 'text';

  return {
    method: 'GET',
    url: `/files/${fileId}/content`,
    headers,
    responseType: 'text',
  } as AxiosRequestConfig;
}

function buildResponse<T extends ChatCompletion | Embeddings>(
  response: AxiosResponse,
): Batch<T> & WithXHeaders {
  if (response.status === 200) {
    const result = buildXHeaders(response, { content: response.data });
    result.content = (result.content as string)
      .split('\n')
      .filter((el) => el != '')
      .map((el) => JSON.parse(el));
    return result;
  } else if (response.status === 401) {
    throw new AuthenticationError(response);
  } else {
    throw new ResponseError(response);
  }
}

export async function get_batch<T extends ChatCompletion | Embeddings>(
  client: AxiosInstance,
  args: GetBatchFileArgs,
): Promise<Batch<T> & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse<T>(response);
}
