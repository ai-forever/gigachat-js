import * as readline from 'node:readline';
import GigaChatClient from 'gigachat';
import * as dotenv from 'dotenv';
import { Message, MessageRole } from '../src/interfaces';

dotenv.config();

const client = new GigaChatClient({
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
      role: MessageRole.USER,
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
      role: MessageRole.ASSISTANT,
      content: responseContent,
    });
    process.stdout.write('Q: ');
  }
}

main();
