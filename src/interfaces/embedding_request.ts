interface EmbeddingRequest {
  /** Название модели, которая будет использована для создания эмбеддинга */
  model: string;

  /** Массив строк, которые будут использованы для генерации эмбеддинга */
  input: string[];
}

export type { EmbeddingRequest };
