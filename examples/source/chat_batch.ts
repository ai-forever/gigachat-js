import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';
import { BATCH_FILE_STATUS, BatchRequest, ChatCompletion } from 'gigachat/interfaces';

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

dotenv.config();

async function main() {
  const client = new GigaChat({
    timeout: 600,
    model: 'GigaChat',
    httpsAgent: httpsAgent,
  });
  const taskList: Record<string, string> = {
    '1': '1 + 3',
    '2': '8 - 16',
    '3': '12 * 2',
    '4': '8 / 4',
    '5': '8 - 16',
  };
  // Создаем массив из нескольких запросов
  const chats: BatchRequest[] = Object.keys(taskList).map((key) => ({
    id: key,
    request: {
      messages: [
        {
          role: 'user',
          content: `Вычисли сколько будет ${taskList[key]} ? Ответ дай в виде числа, без размышлений и комментариев`,
        },
      ],
    },
  }));

  // Создаем пакетную задачу
  const batch = await client.chatsBatch(chats);
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
  const batchFile = await client.getBatch<ChatCompletion>(fileId);

  // обрабатываем ответы
  const result = batchFile.content
    .map((chat) => `${taskList[chat.id]}\t = ${chat.result.choices[0].message.content}`)
    .join('\n');

  console.log(`Результат:\n${result}`);
  // Результат:
  // 1 + 3    = 4
  // 8 - 16   = -8
  // 12 * 2   = 24
  // 8 / 4    = 2
  // 8 - 16   = -8

  // удаляем файл с сервера
  await client.deleteFile(fileId);
}

main();
