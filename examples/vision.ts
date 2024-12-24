import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { Agent } from 'node:https';
import fs from 'node:fs';

dotenv.config();

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

async function main() {
  const client = new GigaChat({
    timeout: 600,
    model: 'GigaChat-Pro',
    httpsAgent: httpsAgent,
  });
  const filePath = path.resolve(__dirname, './media/cat.jpg');
  const buffer = fs.readFileSync(filePath);
  const file = new File([buffer], 'image.jpg', { type: 'image/jpeg' });
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
  console.log(response.choices[0]?.message.content);
}

main();
