import 'dotenv';
import GigaChatClient from 'gigachat';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new GigaChatClient({
    profanityCheck: false,
    verifySslCerts: false,
    timeout: 600,
  });
  const response = await client.embeddings(['Слова слова слова']);
  console.log(response.data);
}

main();
