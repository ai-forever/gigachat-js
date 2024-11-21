import * as readline from 'node:readline';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Message } from '../src/interfaces';

dotenv.config();

const client = new GigaChat({
  profanityCheck: false,
  verifySslCerts: false,
  timeout: 600,
  model: 'GigaChat',
});

const messages: Message[] = [];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

async function main() {
  process.stdout.write('Q: ');
  for await (const question of rl) {
    if (question.trim() == '') {
      rl.close();
      return;
    }
    messages.push({
      role: 'user',
      content: question,
    });
    let responseContent = '';
    const stream = client.stream({
      messages: messages,
    });
    process.stdout.write('AI: ');
    for await (const chunk of stream) {
      responseContent += chunk.choices[0]?.delta.content || '';
      process.stdout.write(chunk.choices[0]?.delta.content || '');
    }
    process.stdout.write('\n');
    messages.push({
      role: 'assistant',
      content: responseContent,
    });
    process.stdout.write('Q: ');
  }
}

main();
