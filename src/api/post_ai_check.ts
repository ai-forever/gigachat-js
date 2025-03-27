import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildHeaders, buildXHeaders } from './utils';
import { AuthenticationError, ResponseError } from '../exceptions';
import { WithXHeaders, AICheckResult } from '../interfaces';

interface AICheckArgs {
  input: string;
  model: string;
  accessToken?: string;
}

function getRequestConfig({ input, model, accessToken }: AICheckArgs): AxiosRequestConfig {
  const headers = buildHeaders(accessToken);

  return {
    method: 'POST',
    url: '/ai/check',
    data: { input, model },
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): AICheckResult & WithXHeaders {
  if (response.status === 200) {
    return buildXHeaders(response, response.data as AICheckResult);
  } else if (response.status === 401) {
    console.error(response.data);
    throw new AuthenticationError(response);
  } else {
    console.error(response.data);
    throw new ResponseError(response);
  }
}

export async function post_ai_check(
  client: AxiosInstance,
  args: AICheckArgs,
): Promise<AICheckResult & WithXHeaders> {
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
