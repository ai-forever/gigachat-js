interface Token {
  /** Сгенерированный Access Token */
  tok: string;

  /** Unix-время завершения действия Access Token в миллисекундах */
  exp: number;
}

export type { Token };
