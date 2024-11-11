export class GigaChatException extends Error {
  constructor(...args: any[]) {
    super(args.join());
    this.name = 'GigaChatException';
  }
}

export class ResponseError extends GigaChatException {
  constructor(...args: any[]) {
    super(...args);
    this.name = 'ResponseError';
  }
}

export class AuthenticationError extends ResponseError {
  constructor(...args: any[]) {
    super(...args);
    this.name = 'AuthenticationError';
  }
}
