import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { UploadedFiles, WithXHeaders } from '../interfaces';

interface GetFilesArgs {
  accessToken?: string;
}

function getRequestConfig({ accessToken }: GetFilesArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'GET',
    url: `/files`,
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): UploadedFiles & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as UploadedFiles);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function get_files(
  client: AxiosInstance,
  args: GetFilesArgs,
): Promise<UploadedFiles & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
