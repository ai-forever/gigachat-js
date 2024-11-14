const ENV_PREFIX = 'GIGACHAT_';

interface Settings {
  /** Адрес относительно которого выполняются запросы */
  baseUrl: string;

  /** Адрес для запроса токена доступа OAuth 2.0 */
  authUrl: string;

  /** Авторизационные данные */
  credentials?: string;

  /** Версия API, к которой предоставляется доступ */
  scope: string;

  /** JWE токен */
  accessToken?: string;

  /** Название модели, от которой нужно получить ответ */
  model?: string;

  /** Параметр цензуры */
  profanityCheck?: boolean;

  /** Имя пользователя */
  user?: string;

  /** Пароль */
  password?: string;

  /** Таймаут в секундах */
  timeout: number;

  /** Проверка SSL-сертификатов */
  verifySslCerts: boolean;

  /** Детализация запросов в консоли */
  verbose: boolean;

  /** Путь к файлу с CA-бандлом */
  caBundle?: string | Buffer | Array<string | Buffer>;

  /** Путь к файлу сертификата */
  cert?: string | Buffer | Array<string | Buffer>;

  /** Путь к файлу ключа */
  key?: string | Buffer | Array<string | Buffer>;

  /** Пароль для ключевого файла */
  keyPassword?: string;

  /** Флаги, включающие особенные фичи */
  flags?: string[];

  /** HTTPS Agent, который прокидывается в Axios клиент */
  httpsAgent?: any;
}

function getDefaultSettings(): Settings {
  const BASE_URL = process?.env[`${ENV_PREFIX}BASE_URL`] || 'https://gigachat.devices.sberbank.ru/api/v1';
  const AUTH_URL =
    process?.env[`${ENV_PREFIX}AUTH_URL`] || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  const SCOPE = process?.env[`${ENV_PREFIX}SCOPE`] || 'GIGACHAT_API_PERS';
  let verifySslCerts = true;
  if (`${ENV_PREFIX}VERIFY_SSL_CERTS` in process?.env) {
    verifySslCerts = process?.env[`${ENV_PREFIX}VERIFY_SSL_CERTS`] === 'true';
  }
  let caBundleFile,
    certFile,
    keyFile = null;
  if (typeof window === 'undefined' && typeof require !== 'undefined') {
    const fs = require('fs');
    const caBundleFilePath = process?.env[`${ENV_PREFIX}CA_BUNDLE_FILE`];
    caBundleFile = caBundleFilePath ? fs.readFileSync(caBundleFilePath) : undefined;
    const certFilePath = process?.env[`${ENV_PREFIX}CERT_FILE`];
    certFile = certFilePath ? fs.readFileSync(certFilePath) : undefined;
    const keyFilePath = process?.env[`${ENV_PREFIX}KEY_FILE`];
    keyFile = keyFilePath ? fs.readFileSync(keyFilePath) : undefined;
  }
  return {
    baseUrl: BASE_URL,
    authUrl: AUTH_URL,
    scope: SCOPE,
    timeout: parseFloat(process?.env[`${ENV_PREFIX}TIMEOUT`] || '30.0'),
    verifySslCerts: verifySslCerts,
    verbose: process?.env[`${ENV_PREFIX}VERBOSE`] === 'true',
    credentials: process?.env[`${ENV_PREFIX}CREDENTIALS`] || undefined,
    accessToken: process?.env[`${ENV_PREFIX}ACCESS_TOKEN`] || undefined,
    model: process?.env[`${ENV_PREFIX}MODEL`] || undefined,
    profanityCheck: process?.env[`${ENV_PREFIX}PROFANITY_CHECK`] === 'true',
    user: process?.env[`${ENV_PREFIX}USER`] || undefined,
    password: process?.env[`${ENV_PREFIX}PASSWORD`] || undefined,
    caBundle: caBundleFile || process?.env[`${ENV_PREFIX}CA_BUNDLE`] || undefined,
    cert: certFile || process?.env[`${ENV_PREFIX}CERT`] || undefined,
    key: keyFile || process?.env[`${ENV_PREFIX}KEY`] || undefined,
    keyPassword: process?.env[`${ENV_PREFIX}KEY_PASSWORD`] || undefined,
    flags: process?.env[`${ENV_PREFIX}FLAGS`] ? process.env[`${ENV_PREFIX}FLAGS`]?.split(',') : undefined,
  } as Settings;
}

export type { Settings };

export { getDefaultSettings, ENV_PREFIX };
