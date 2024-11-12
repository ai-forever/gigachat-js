import { Embedding } from './embedding';

interface Embeddings {
  /** Массив ответов эмбеддера */
  data: Embedding[];

  /** Название модели, с помощью которой нужно вычислить эмбеддинги */
  model?: string;

  /** Название вызываемого метода */
  object: string;
}

export type { Embeddings };
