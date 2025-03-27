import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { DeletedFile, WithXHeaders } from '../interfaces';

interface DeleteFileArgs {
  file: string;
  accessToken?: string;
}

function getRequestConfig({ file, accessToken }: DeleteFileArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'POST',
    url: `/files/${file}/delete`,
    headers: headers,
    data: {},
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): DeletedFile & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as DeletedFile);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function post_files_delete(
  client: AxiosInstance,
  args: DeleteFileArgs,
): Promise<DeletedFile & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
