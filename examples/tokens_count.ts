import 'dotenv';
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
  const resp = await client.tokensCount(['Привет, как дела?', 'Как дела, как дела']);
  console.log(resp);
}

main();
