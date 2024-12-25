import 'dotenv';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';

dotenv.config();

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

async function main() {
  const client = new GigaChat({
    timeout: 600,
    httpsAgent: httpsAgent,
  });
  const response = await client.embeddings(['Слова слова слова']);
  console.log(response.data);
}

main();
