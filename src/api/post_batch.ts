import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { WithXHeaders, BatchRequest, BATCH_METHOD, BatchStatus } from '../interfaces';
import { AuthenticationError, ResponseError } from '../exceptions';
import { buildHeaders, buildXHeaders } from './utils';

interface GetChatArgs {
  batch: BatchRequest[];
  method: BATCH_METHOD;
  accessToken?: string;
}

function getBatchesRequestConfig({ batch, method, accessToken }: GetChatArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);
  const requestString = batch.map((request) => JSON.stringify(request)).join('\n');
  const blob = new Blob([requestString], { type: 'application/octet-stream' });

  headers['Content-Type'] = 'application/octet-stream';

  return {
    method: 'POST',
    url: '/batches',
    params: {
      method,
    },
    data: blob,
    headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): BatchStatus & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as BatchStatus);
  }
  if (response.status === 401) {
    throw new AuthenticationError(response);
  }
  throw new ResponseError(response);
}

export async function post_batch(
  client: AxiosInstance,
  args: GetChatArgs,
): Promise<BatchStatus & WithXHeaders> {
  const config = getBatchesRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
