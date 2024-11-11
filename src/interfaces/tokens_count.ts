interface TokensCount {
  /** Количество токенов в соответствующей строке */
  tokens: number;

  /** Количество символов в соответствующей строке */
  characters: number;

  /** Тип сущности в ответе, например, список */
  object: string;
}

export { TokensCount };
