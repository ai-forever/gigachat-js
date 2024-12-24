import { AxiosInstance, AxiosRequestConfig, AxiosResponse, RawAxiosRequestConfig } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { UploadedFile, WithXHeaders } from '../interfaces';

interface UploadFileArgs {
  file: File;
  purpose?: 'general' | 'assistant';
  accessToken?: string;
}

function getRequestConfig({ file, purpose = 'general', accessToken }: UploadFileArgs): RawAxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  return {
    method: 'POST',
    url: '/files',
    data: formData,
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

export async function post_files(
  client: AxiosInstance,
  args: UploadFileArgs,
): Promise<UploadedFile & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
