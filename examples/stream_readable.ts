import 'dotenv';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new GigaChat({
    profanityCheck: false,
    verifySslCerts: false,
    timeout: 600,
    model: 'GigaChat',
  });
  const readable = await client.stream_readable('Напиши сочинение про слона');
  readable.on('data', (chunk) => {
    process.stdout.write(chunk.choices[0]?.delta.content || '');
  });
}

main();
