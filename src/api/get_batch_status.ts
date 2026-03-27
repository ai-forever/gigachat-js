import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { BatchStatus, WithXHeaders } from '../interfaces';

interface GetBatchArgs {
  batchId: string;
  accessToken?: string;
}

function getRequestConfig({ batchId, accessToken }: GetBatchArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'GET',
    url: `/batches`,
    params: {
      batch_id: batchId,
    },
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): BatchStatus & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data[0] as BatchStatus);
  } else if (response.status === 401) {
    throw new AuthenticationError(response);
  } else {
    throw new ResponseError(response);
  }
}

export async function get_batch_status(
  client: AxiosInstance,
  args: GetBatchArgs,
): Promise<BatchStatus & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
