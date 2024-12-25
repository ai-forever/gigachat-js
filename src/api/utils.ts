import { USER_AGENT } from '../constants';
import { AxiosResponse } from 'axios';
import { WithXHeaders } from 'gigachat/interfaces';

export function buildHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (!isRunningInBrowser()) {
    headers['User-Agent'] = USER_AGENT;
  } else {
    headers['X-User-Agent'] = USER_AGENT;
  }

  return headers;
}

export function parseChunk<T>(line: string): T | null {
  try {
    const [name, value] = line.split(': ');
    if (name === 'data') {
      if (value === '[DONE]') {
        return null;
      } else {
        return value ? JSON.parse(value) : null;
      }
    }
  } catch (e) {
    console.error(`Error parsing chunk from server: ${e}, raw value: ${line}`);
    throw e;
  }
  return null;
}

export function buildXHeaders<T>(response: AxiosResponse, data: T): T & WithXHeaders {
  const headers = response.headers;
  const withXHeaders: WithXHeaders = {
    xHeaders: {},
  };
  if (headers) {
    withXHeaders.xHeaders = {
      xRequestID: headers['x-request-id'],
      xSessionID: headers['x-session-id'],
      xClientID: headers['x-client-id'],
    };
  }
  return {
    ...data,
    ...withXHeaders,
  };
}

export function isRunningInBrowser() {
  return (
    // @ts-ignore
    typeof window !== 'undefined' &&
    // @ts-ignore
    typeof window.document !== 'undefined' &&
    // @ts-ignore
    typeof navigator !== 'undefined'
  );
}

export { USER_AGENT };
