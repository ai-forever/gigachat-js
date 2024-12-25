import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Agent } from 'node:https';

dotenv.config();

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

async function main() {
  const client = new GigaChat({
    profanityCheck: false,
    timeout: 600,
    model: 'GigaChat',
    httpsAgent: httpsAgent,
    dangerouslyAllowBrowser: true,
  });
  const readable = await client.stream_readable('Напиши сочинение про слона');
  readable.on('chunk', (chunk) => {
    process.stdout.write(chunk.choices[0]?.delta.content || '');
  });
}

main();
