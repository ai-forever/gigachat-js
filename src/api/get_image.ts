import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { Image } from '../interfaces/image';
import { WithXHeaders } from 'gigachat/interfaces';

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
    responseEncoding: 'binary',
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): Image & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, { content: response.data } as Image);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function get_image(client: AxiosInstance, args: GetImageArgs): Promise<Image & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
