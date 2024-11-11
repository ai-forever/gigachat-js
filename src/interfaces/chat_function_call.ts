interface ChatFunctionCall {
  /** Название функции */
  name: string;

  /** Часть аргументов функции */
  partial_arguments?: { [key: string]: any };
}

export { ChatFunctionCall };
