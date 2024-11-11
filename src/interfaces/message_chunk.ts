import { MessageRole } from './message_role';
import { FunctionCall } from './function_call';

interface MessageChunk {
  /** Роль автора сообщения */
  role?: MessageRole;

  /** Текст сообщения */
  content?: string;

  /** Вызов функции */
  function_call?: FunctionCall;
}

export { MessageChunk };
