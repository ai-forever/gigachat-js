import { FinishReason } from './finish_reason';
import { MessageChunk } from './message_chunk';

interface ChoicesChunk {
  /** Короткое сообщение */
  delta: MessageChunk;

  /** Индекс сообщения в массиве начиная с нуля */
  index: number;

  /** Причина завершения гипотезы */
  finish_reason?: FinishReason;
}

export type { ChoicesChunk };
