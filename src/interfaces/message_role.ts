enum MessageRole {
  /** Роль ассистента */
  ASSISTANT = 'assistant',

  /** Системное сообщение */
  SYSTEM = 'system',

  /** Сообщение от пользователя */
  USER = 'user',

  /** Сообщение функции */
  FUNCTION = 'function',

  /** Сообщение с результатом поиска */
  SEARCH_RESULT = 'search_result',

  /** Функция в процессе выполнения */
  FUNCTION_IN_PROGRESS = 'function_in_progress',
}

export { MessageRole };
