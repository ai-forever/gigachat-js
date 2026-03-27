import { ChatCompletion, Embeddings } from './';

interface Batch<T extends ChatCompletion | Embeddings> {
  /** Файл с результатом пакетной обработки */
  content: {
    id: string;
    result: T;
  }[];
}

export type { Batch };
