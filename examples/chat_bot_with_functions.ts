import * as readline from 'node:readline';
import GigaChat from 'gigachat';
import * as dotenv from 'dotenv';
import { Message } from '../src/interfaces';
import { Agent } from 'node:https';
import fs from 'node:fs';

dotenv.config();

const httpsAgent = new Agent({
  ca: fs.readFileSync('russiantrustedca.pem'),
});

const client = new GigaChat({
  timeout: 600,
  model: 'GigaChat-Max',
  httpsAgent: httpsAgent,
});

const messages: Message[] = [
  {
    role: 'system',
    content: `Ты бот-консультант продуктового магазина. 
Помни, что у тебя есть следующие функции:
  get_products: Получает текущие позиции в магазине
  get_product_info: Получает информацию о продукте (цена, количество)
Помни, что ты можешь вызывать функции последовательно
`,
  },
];
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const PRODUCTS_DB = [
  {
    name: 'Молоко',
    price: 100,
    quantity: 10,
    id: 0,
  },
  {
    name: 'Хлеб',
    price: 70,
    quantity: 0,
    id: 1,
  },
  {
    name: 'Сыр',
    price: 200,
    quantity: 20,
    id: 3,
  },
  {
    name: 'Масло',
    price: 170,
    quantity: 20,
    id: 4,
  },
];

function get_products(): any {
  console.log('Вызов функции: get_products');
  return PRODUCTS_DB.map((product) => {
    return { name: product.name, id: product.id };
  });
}

function get_product_info(args: any) {
  console.log('Вызов функции: get_products_info');
  console.log(`С параметрами: ${JSON.stringify(args)}`);
  return PRODUCTS_DB.filter((product) => args.ids.includes(product.id));
}

async function chat() {
  return await client.chat({
    functions: [
      {
        name: 'get_products',
        description: 'Получает какие продукты есть в магазине',
        parameters: {
          type: 'object',
          properties: {
            arg: {
              type: 'string',
            },
          },
        },
        return_parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Название позиции',
            },
            id: {
              type: 'string',
              description: 'ID позиции',
            },
          },
        },
      },
      {
        name: 'get_product_info',
        description: 'Получает информацию об определенном продукте в магазине',
        parameters: {
          type: 'object',
          properties: {
            ids: {
              type: 'array',
              items: {
                type: 'number',
                description: 'ID продуктов',
              },
            },
          },
        },
        return_parameters: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Название позиции',
                  },
                  id: {
                    type: 'string',
                    description: 'ID позиции',
                  },
                  quantity: {
                    type: 'string',
                    description: 'Количество',
                  },
                  price: {
                    type: 'string',
                    description: 'Цена',
                  },
                },
              },
            },
          },
        },
      },
    ],
    messages: messages,
  });
}

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
    let response = await chat();
    if (response.choices[0]?.message) messages.push(response.choices[0].message);
    if (response.choices[0]?.message.function_call) {
      let function_result: any = {};
      switch (response.choices[0].message.function_call.name) {
        case 'get_products':
          function_result = get_products();
          break;
        case 'get_product_info':
          function_result = get_product_info(response.choices[0].message.function_call.arguments);
          break;
      }
      messages.push({
        role: 'function',
        content: JSON.stringify(function_result),
      });
      response = await chat();
    }
    process.stdout.write(`AI: ${response.choices[0]?.message.content}\n`);
    process.stdout.write('Q: ');
  }
}

main();
