# GigaChat SDK (TypeScript/JavaScript) библиотека

Данная библиотека реализует методы [REST API GigaChat](https://developers.sber.ru/docs/ru/gigachat/api/reference/rest/gigachat-api).
Она является частью [GigaChain](https://github.com/ai-forever/gigachain)

Вот часть того, что она поддерживает:

- [чат](examples/source/chat.ts)
- [обработку потоковой передачи токенов](examples/source/stream.ts)
- [работу с функциями](examples/source/chat_bot_with_functions.ts);
- [создание эмбеддингов](examples/source/embeddings.ts);
- [работу с GigaChat Vision](examples/source/vision.ts)

> [!TIP]
> Больше примеров работы с библиотекой gigachat — в папке [examples](examples/README.md).

## Установка

```sh
npm install gigachat
```

## Быстрый старт

Для работы с библиотекой вам понадобится ключ авторизации API.

Чтобы получить ключ авторизации:

1. Создайте проект **GigaChat API** в личном кабинете Studio.
2. В интерфейсе проекта, в левой панели выберите раздел **Настройки API**.
3. Нажмите кнопку **Получить ключ**.

В открывшемся окне скопируйте и сохраните значение поля Authorization Key. Ключ авторизации, отображается только один раз и не хранятся в личном кабинете. При компрометации или утере ключа авторизации вы можете сгенерировать его повторно.

Подробно о том, как создать проект GigaChat API — в официальной документации, в разделах [Быстрый старт для физических лиц](https://developers.sber.ru/docs/ru/gigachat/individuals-quickstart) и [Быстрый старт для ИП и юридических лиц](https://developers.sber.ru/docs/ru/gigachat/legal-quickstart).

Передайте полученный ключ авторизации в параметре `credentials` при инициализации объекта GigaChat.

Пример показывает как отправить простой запрос на генерацию с помощью библиотеки GigaChat:

```ts
import GigaChat from 'gigachat';
import { Agent } from 'node:https';

const httpsAgent = new Agent({
  rejectUnauthorized: false, // Отключает проверку корневого сертификата
  // Читайте ниже как можно включить проверку сертификата Мин. Цифры
});

const client = new GigaChat({
  timeout: 600,
  model: 'GigaChat',
  credentials: 'ваш_ключ_авторизации',
  httpsAgent: httpsAgent,
});

client
  .chat({
    messages: [{ role: 'user', content: 'Привет, как дела?' }],
  })
  .then((resp) => {
    console.log(resp.choices[0]?.message.content);
  });
```

## Способы авторизации

Для авторизации запросов, кроме ключа, полученного в личном кабинете, вы можете использовать:

- credentials
- имя пользователя и пароль для доступа к сервису;
- сертификаты TLS;
- токен доступа (access token), полученный в обмен на ключ авторизации в запросе [`POST /api/v2/oauth`](https://developers.sber.ru/docs/ru/gigachat/api/reference/rest/post-token).

Для этого передайте соответствующие параметры при инициализации.

Пример авторизации с credentials:

```ts
const client = new GigaChat({
  credentials: 'креды',
  scope: 'GIGACHAT_API_PERS / GIGACHAT_API_B2B / GIGACHAT_API_CORP',
});
```

Пример авторизации с помощью логина и пароля:

```ts
const client = new GigaChat({
  baseUrl: 'BASE URL апи',
  user: 'юзернейм',
  password: 'пароль',
});
```

Авторизация с помощью сертификатов по протоколу TLS (mTLS):

```ts
import GigaChat from 'gigachat';
import { Agent } from 'node:https';
import fs from 'node:fs';

const httpsAgent = new Agent({
  ca: fs.readFileSync('certs/ca.pem'),
  cert: fs.readFileSync('certs/tls.pem'),
  key: fs.readFileSync('certs/tls.key'),
  passphrase: 'пароль от приватного ключа',
});

const client = new GigaChat({
  baseUrl: 'BASE URL апи',
  httpsAgent: httpsAgent,
});
```

Авторизация с помощью токена доступа:

```ts
const client = new GigaChat({
  baseUrl: 'BASE URL апи',
  accessToken: 'токен',
});
```

> ![NOTE]
> Токен действителен в течение 30 минут.

### Предварительная авторизация

По умолчанию, библиотека GigaChat получает токен доступа при первом запросе к API.

Если вам нужно получить токен и авторизоваться до выполнения запроса, инициализируйте объект GigaChat и вызовите метод `get_token()`.

```ts
const client = new GigaChat({
  credentials: 'креды',
  scope: 'GIGACHAT_API_PERS / GIGACHAT_API_B2B / GIGACHAT_API_CORP',
});
await giga.updateToken();
```

## Параметры объекта GigaChat

В таблице описаны параметры, которые можно передать при инициализации объекта GigaChat:

| Параметр                  | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `credentials`             | Ключ авторизации для обмена сообщениями с GigaChat API.<br />Ключ авторизации содержит информацию о версии API, к которой выполняются запросы. Если вы используете версию API для ИП или юрлиц, укажите это явно в параметре `scope`                                                                                                                                                                                                                                                                                                                   |
| `scope`                   | Версия API, к которой будет выполнен запрос. По умолчанию запросы передаются в версию для физических лиц. Возможные значения:<ul><li>`GIGACHAT_API_PERS` — версия API для физических лиц;</li><li>`GIGACHAT_API_B2B` — версия API для ИП и юрлиц при работе по предоплате.</li><li>`GIGACHAT_API_CORP` — версия API для ИП и юрлиц при работе по постоплате.</li></ul>                                                                                                                                                                                 |
| `model`                   | необязательный параметр, в котором можно явно задать [модель GigaChat](https://developers.sber.ru/docs/ru/gigachat/models). Вы можете посмотреть список доступных моделей с помощью метода `get_models()`, который выполняет запрос [`GET /models`](https://developers.sber.ru/docs/ru/gigachat/api/reference#get-models).<br /><br />Стоимость запросов к разным моделям отличается. Подробную информацию о тарификации запросов к той или иной модели вы ищите в [официальной документации](https://developers.sber.ru/docs/ru/gigachat/api/tariffs) |
| `baseUrl`                 | Адрес API. По умолчанию запросы отправляются по адресу `https://gigachat.devices.sberbank.ru/api/v1/`, но если вы хотите использовать [модели в раннем доступе](https://developers.sber.ru/docs/ru/gigachat/models/preview-models), укажите адрес `https://gigachat-preview.devices.sberbank.ru/api/v1`                                                                                                                                                                                                                                                |
| `httpsAgent`              | Настройки HTTPS, которые добавляются при подключении к серверу API (подключение по сертификату, отключение проверки корневого сертифаката и т.д). <br/><br/>**В браузере не поддерживается!**                                                                                                                                                                                                                                                                                                                                                          |
| `dangerouslyAllowBrowser` | Флаг, включащий библиотеку в браузере.<br /> По умолчанию, данная библиотека в браузере не работает, так как так можно разоблачить ваш GigaChat токен.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `timeout`                 | Таймаут (в секундах), который используется при подключении                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Переменные окружения

Также клиент автоматически подтягивает настройки из следующих переменных окружения:

- GIGACHAT_CREDENTIALS
- GIGACHAT_SCOPE
- GIGACHAT_BASE_URL
- GIGACHAT_MODEL
- GIGACHAT_TIMEOUT

**Не работает в браузере**

## Работа в браузере

По умолчанию, библиотека в браузере выкидывает Exception.
Чтобы его отключить инициализируйте клиент так:

```ts
const client = new GigaChat({
  timeout: 600,
  model: 'GigaChat',
  credentials: 'ваш_ключ_авторизации',
  dangerouslyAllowBrowser: true,
});
```

Также в браузере нельзя создавать клиент с настройками HTTPS, то есть
нельзя будет отключить игнорирование сертификатов.
