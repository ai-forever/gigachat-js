import { Chat } from '.';
import { EmbeddingRequest } from '.';

interface BatchRequest {
  /** Идентификатор подзадачи. Должен быть уникален в рамках всего файла */
  id: string;

  /**  запрос  */
  request: Chat | EmbeddingRequest;
}

export type { BatchRequest };
