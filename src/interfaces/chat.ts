import { ChatFunctionCall } from './chat_function_call';
import { Function } from './function';
import { Message } from './message';

type FunctionCall = 'auto' | 'none' | ChatFunctionCall;

interface Chat {
  /** Название модели, от которой нужно получить ответ */
  model?: string;

  /** Массив сообщений */
  messages: Message[];

  /** Температура выборки в диапазоне от ноля до двух */
  temperature?: number;

  /** Альтернатива параметру температуры */
  top_p?: number;

  /** Количество вариантов ответов, которые нужно сгенерировать для каждого входного сообщения */
  n?: number;

  /** Указывает, что сообщения надо передавать по частям в потоке */
  stream?: boolean;

  /** Максимальное количество токенов, которые будут использованы для создания ответов */
  max_tokens?: number;

  /** Количество повторений слов */
  repetition_penalty?: number;

  /** Интервал в секундах между отправкой токенов в потоке */
  update_interval?: number;

  /** Параметр цензуры */
  profanity_check?: boolean;

  /** Правила вызова функций */
  function_call?: FunctionCall;

  /** Набор функций, которые могут быть вызваны моделью */
  functions?: Function[];

  /** Флаги, включающие особенные фичи */
  flags?: string[];
}

export type { Chat };
