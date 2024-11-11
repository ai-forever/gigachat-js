import 'dotenv';
import { GigaChatClient } from 'gigachat';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new GigaChatClient({
    profanityCheck: false,
    verifySslCerts: false,
    timeout: 600,
    model: 'GigaChat',
  });
  const response = await client.stream('Напиши сочинение про слона');

  response.on('data', (chunk) => {
    process.stdout.write(chunk.choices[0].delta.content);
  });
}

main();
