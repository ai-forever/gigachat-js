import 'dotenv';
import { GigaChat, detectImage } from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';
import * as fs from 'node:fs';
import path from 'node:path';

const httpsAgent = new Agent({
  ca: fs.readFileSync('russiantrustedca.pem'),
});

dotenv.config();

async function main() {
  const client = new GigaChat({
    timeout: 600,
    model: 'GigaChat',
    httpsAgent: httpsAgent,
  });
  const resp = await client.chat({
    messages: [
      {
        role: 'user',
        content: 'Сгенерируй изображение котика',
      },
    ],
    function_call: 'auto',
  });
  const detectedImage = detectImage(resp.choices[0]?.message.content ?? '');
  if (detectedImage && detectedImage.uuid) {
    const image = await client.getImage(detectedImage.uuid);
    fs.writeFile('image.jpg', image.content, 'binary', function (err) {
      if (err) throw err;
      console.log(`Сохранили изображение по пути ${path.resolve(__dirname, './image.jpg')}`);
      console.log(`Сообщение к изображению: "${detectedImage.postfix}"`);
    });
  } else {
    console.log(resp.choices[0]?.message.content);
    console.log('Изображение не сгенерировалось');
  }
}

main();
