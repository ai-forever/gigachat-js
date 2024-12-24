import 'dotenv';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';
import * as fs from 'node:fs';

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
  const resp = await client.tokensCount(['Привет, как дела?', 'Как дела, как дела']);
  console.log(resp);
}

main();
