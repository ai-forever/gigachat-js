import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { UploadedFile, WithXHeaders } from '../interfaces';

interface GetFileArgs {
  file: string;
  accessToken?: string;
}

function getRequestConfig({ file, accessToken }: GetFileArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'GET',
    url: `/files/${file}`,
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): UploadedFile & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as UploadedFile);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function get_file(
  client: AxiosInstance,
  args: GetFileArgs,
): Promise<UploadedFile & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
