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
  for await (const chunk of client.stream('Напиши сочинение про слона')) {
    process.stdout.write(chunk.choices[0]?.delta.content || '');
  }
}

main();
