import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';

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
  console.log(await client.balance());
}

main();
