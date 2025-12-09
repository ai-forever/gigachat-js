import { FinishReason } from './finish_reason';
import { Message } from './message';

interface Choices {
  /** Сгенерированное сообщение */
  message: Message;

  /** Индекс сообщения в массиве начиная с нуля */
  index: number;

  /** Причина завершения гипотезы */
  finish_reason?: FinishReason;
}

export type { Choices };
