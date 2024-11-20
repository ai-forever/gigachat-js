interface _ChatFunctionCall {
  /** Название функции */
  name: string;

  /** Часть аргументов функции */
  partial_arguments?: { [key: string]: any };
}

type ChatFunctionCall = 'auto' | 'none' | _ChatFunctionCall;

export type { ChatFunctionCall };
