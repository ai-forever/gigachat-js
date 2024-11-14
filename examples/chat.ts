import 'dotenv';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new GigaChat({
    verifySslCerts: false,
    timeout: 600,
    model: 'GigaChat',
  });
  const resp = await client.chat('Привет, как дела?');
  console.log(resp.choices[0]?.message.content);
}

main();
