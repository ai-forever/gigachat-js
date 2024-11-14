import 'dotenv';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new GigaChat({
    profanityCheck: false,
    verifySslCerts: false,
    timeout: 600,
  });
  const response = await client.embeddings(['Слова слова слова']);
  console.log(response.data);
}

main();
