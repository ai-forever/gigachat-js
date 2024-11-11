import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Image } from '../interfaces/image';
import * as base64 from 'base-64';

interface GetImageArgs {
  fileId: string;
  accessToken?: string;
}

function getRequestConfig({ fileId, accessToken }: GetImageArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);
  headers['Accept'] = 'application/jpg';

  return {
    method: 'GET',
    url: `/files/${fileId}/content`,
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): Image {
  if (response.status === 200) {
    return { content: base64.encode(response.data) };
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url, response.status, response.data, response.headers);
  }
}

export async function get_image(client: AxiosInstance, args: GetImageArgs): Promise<Image> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
