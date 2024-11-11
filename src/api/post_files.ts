import { AxiosInstance, AxiosRequestConfig, AxiosResponse, RawAxiosRequestConfig } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { UploadedFile } from '../interfaces';

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

function buildResponse(response: AxiosResponse): UploadedFile {
  if (response.status === 200) {
    return response.data as UploadedFile;
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

export async function post_files(client: AxiosInstance, args: UploadFileArgs): Promise<UploadedFile> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
