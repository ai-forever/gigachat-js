import { AxiosResponse } from 'axios';

export class GigaChatException extends Error {
  public response: AxiosResponse;

  constructor(response: AxiosResponse) {
    super(response.data);
    this.name = 'GigaChatException';
    this.response = response;
  }
}

export class ResponseError extends GigaChatException {
  constructor(response: AxiosResponse) {
    super(response);
    this.name = 'ResponseError';
  }
}

export class AuthenticationError extends ResponseError {
  constructor(response: AxiosResponse) {
    super(response);
    this.name = 'AuthenticationError';
  }
}
