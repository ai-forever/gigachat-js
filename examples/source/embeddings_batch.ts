import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';
import { BATCH_FILE_STATUS, BatchRequest, Embeddings } from 'gigachat/interfaces';

dotenv.config();

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

async function main() {
  const client = new GigaChat({
    timeout: 600,
    httpsAgent: httpsAgent,
  });

  const request: BatchRequest[] = [
    { id: '111', request: { input: ['Слова слова слова'], model: 'Embeddings' } },
    { id: '222', request: { input: ['Слова слова слова'], model: 'Embeddings' } },
    { id: '333', request: { input: ['Слова слова слова'], model: 'Embeddings' } },
  ];

  // Создаем пакетную задачу
  const batch = await client.embeddingsBatch(request);
  const {
    id: batchId,
    method,
    request_counts: { total: requestCount },
  } = batch;
  console.log(`Создан пакет запросов, id: ${batchId}, метод: ${method}, запросов: ${requestCount}.`);

  // Получаем список созданных пакетных задач
  const batches = await client.getBatches();
  console.log(
    'Список созданных задач:\n',
    batches.data.map(({ id }) => id),
  );

  // опрашиваем статус задачи лонг пулингом
  let fileId = '';

  let isPolling = true;
  while (isPolling) {
    // Получаем статус пакета задач по его id
    const batchStatus = await client.getBatchStatus(batchId);
    console.log(
      'Статус выполнения задачи',
      '\nid:',
      batchId,
      '\nстатус:',
      batchStatus.status,
      '\nвыполнено',
      batchStatus.request_counts.completed || 0,
      'из',
      batchStatus.request_counts.total,
      '\nошибок',
      batchStatus.request_counts.failed || 0,
    );

    // если задача выполнена, прекращаем опрос
    if (batchStatus.status === BATCH_FILE_STATUS.completed && batchStatus.output_file_id) {
      isPolling = false;
      fileId = batchStatus.output_file_id;
      break;
    }
    // Ждем 1 секунду перед следующим запросом
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // получаем файл с результатом пакетного запроса
  const batchFile = await client.getBatch<Embeddings>(fileId);
  batchFile.content.map(console.log);

  // удаляем файл с сервера
  await client.deleteFile(fileId);
}

main();
