interface Usage {
  /** Количество токенов во входящем сообщении */
  prompt_tokens: number;
  /** Количество токенов, сгенерированных моделью */
  completion_tokens: number;
  /** Количество кэшированных токенов */
  precached_prompt_tokens: number;
  /** Общее количество токенов */
  total_tokens: number;
}

export type { Usage };
