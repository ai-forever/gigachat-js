/** Имена методов, в которые пойдет запрос на выполнение */
enum BATCH_METHOD {
  chatCompletions = 'chat_completions',
  embedder = 'embedder',
}

/** Статусы обработки файла */
enum BATCH_FILE_STATUS {
  created = 'created',
  inProgress = 'in_progress',
  completed = 'completed',
}

interface BatchStatus {
  /** Идентификатор созданной пакетной задачи */
  id: string;

  /** Имя метода, в который пойдет запрос на выполнение */
  method: BATCH_METHOD;

  /**  */
  request_counts: {
    /** Общее количество запросов */
    total: number;

    /** Количество обработанных запросов */
    completed?: number;

    /** Количество ошибочных запросов */
    failed?: number;
  };

  /** Статус обработки файла */
  status: BATCH_FILE_STATUS;

  /** Идентификатор файла с результатами обработки запросов пакета */
  output_file_id?: string;

  /** Время создания файла в формате unix timestamp */
  created_at: number;

  /** Время обновления файла в формате unix timestamp */
  updated_at: number;
}

export { type BatchStatus, BATCH_FILE_STATUS, BATCH_METHOD };
