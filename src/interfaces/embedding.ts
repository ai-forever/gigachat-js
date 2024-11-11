import { EmbeddingsUsage } from './embeddings_usage';

interface Embedding {
  /** Эмбеддинг */
  embedding: number[];

  /** Данные об использовании модели */
  usage: EmbeddingsUsage;

  /** Индекс эмбеддинга в массиве */
  index: number;

  /** Название объекта */
  object: string;
}

export { Embedding };
