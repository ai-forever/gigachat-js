import { ChoicesChunk } from './choices_chunk';

interface ChatCompletionChunk {
  /** Массив ответов модели в потоке */
  choices: ChoicesChunk[];

  /** Дата и время создания ответа в формате Unix time */
  created: number;

  /** Название модели, которая вернула ответ */
  model: string;

  /** Название вызываемого метода */
  object: string;
}

export { ChatCompletionChunk };
