import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { USER_AGENT } from '../constants';
import { AuthenticationError, ResponseError } from '../exceptions';
import { AccessToken } from '../interfaces';
import * as base64 from 'base-64';
import { v4 as uuidv4 } from 'uuid';

interface AuthArgs {
  url: string;
  credentials: string;
  scope: string;
}

function getRequestConfig(args: AuthArgs): AxiosRequestConfig {
  const headers = {
    Authorization: `Basic ${args.credentials}`,
    RqUID: uuidv4(),
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };

  return {
    method: 'POST',
    url: args.url,
    data: { scope: args.scope },
    headers: headers,
  } as AxiosRequestConfig;
}

function buildResponse(response: AxiosResponse): AccessToken {
  if (response.status === 200) {
    return response.data as AccessToken;
  } else if (response.status === 401) {
    throw new AuthenticationError(response.config.url!, response.status, response.data, response.headers);
  } else {
    throw new ResponseError(response.config.url!, response.status, response.data, response.headers);
  }
}

function validateCredentials(credentials: string): void {
  try {
    base64.decode(credentials);
  } catch (error) {
    console.warn(
      'Invalid credentials format. Please use only base64 credentials (Authorization data, not client secret!)',
    );
  }
}

export async function post_auth(client: AxiosInstance, args: AuthArgs): Promise<AccessToken> {
  validateCredentials(args.credentials);
  const config = getRequestConfig(args);
  const response = await client.request(config);
  return buildResponse(response);
}
