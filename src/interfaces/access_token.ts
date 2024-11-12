interface AccessToken {
  /** Сгенерированный Access Token */
  access_token: string;

  /** Unix-время завершения действия Access Token в миллисекундах */
  expires_at: number;
}

export type { AccessToken };
