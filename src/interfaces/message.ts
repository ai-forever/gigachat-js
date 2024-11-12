import { MessageRole } from './message_role';
import { FunctionCall } from './function_call';

interface Message {
  /** Роль автора сообщения */
  role: MessageRole;

  /** Текст сообщения */
  content?: string;

  /** Вызов функции */
  function_call?: FunctionCall;

  /** Наименование функции. Заполняется, если role = "function" */
  name?: string;

  /** Идентификаторы предзагруженных ранее файлов */
  attachments?: string[];

  /** DEPRECATED: Данные для контекста */
  data_for_context?: Message[];

  /** ID сообщений функций генерирующий изображения/видео */
  functions_state_id?: string;

  /** Идентификатор сообщения */
  id?: any;
}

export type { Message };
