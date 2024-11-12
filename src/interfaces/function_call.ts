interface FunctionCall {
  /** Название функции */
  name: string;

  /** Описание функции */
  arguments?: { [key: string]: any };
}

export type { FunctionCall };
