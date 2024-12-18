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
    profanityCheck: false,
    timeout: 600,
    model: 'GigaChat',
    httpsAgent: httpsAgent,
  });
  const readable = await client.stream_readable('Напиши сочинение про слона');
  readable.on('chunk', (chunk) => {
    process.stdout.write(chunk.choices[0]?.delta.content || '');
  });
}

main();
