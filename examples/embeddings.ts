import 'dotenv';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';
import fs from 'node:fs';

dotenv.config();

const httpsAgent = new Agent({
  ca: fs.readFileSync('russiantrustedca.pem'),
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
