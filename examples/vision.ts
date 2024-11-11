import { GigaChatClient } from 'gigachat';
import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import * as path from 'node:path';
dotenv.config();

async function main() {
  const client = new GigaChatClient({
    profanityCheck: false,
    verifySslCerts: false,
    timeout: 600,
    model: 'GigaChat-Pro',
  });
  const filePath = path.resolve(__dirname, './media/cat.jpg');
  const buffer = await readFile(filePath);
  const fileName = filePath.split('/').pop() || 'image.jpg';
  const file = new File([buffer], fileName, { type: 'image/jpeg' });
  const uploadedFile = await client.uploadFile(file);
  const response = await client.chat({
    messages: [
      {
        role: 'user',
        content: 'Какой окрас у котенка на фото?',
        attachments: [uploadedFile.id],
      },
    ],
    temperature: 0.1,
  });
  console.log(response.choices[0].message.content);
}

main();
