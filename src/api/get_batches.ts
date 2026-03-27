import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { BatchStatuses, WithXHeaders } from '../interfaces';

interface GetBatchesArgs {
  accessToken?: string;
}

function getRequestConfig({ accessToken }: GetBatchesArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'GET',
    url: `/batches`,
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): BatchStatuses & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, { data: response.data } as BatchStatuses);
  } else if (response.status === 401) {
    throw new AuthenticationError(response);
  } else {
    throw new ResponseError(response);
  }
}

export async function get_batches(
  client: AxiosInstance,
  args: GetBatchesArgs,
): Promise<BatchStatuses & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
