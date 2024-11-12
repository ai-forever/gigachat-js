import { USER_AGENT } from '../constants';

export function buildHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  headers['User-Agent'] = USER_AGENT;
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

export { USER_AGENT };
