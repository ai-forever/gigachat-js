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

  /** Детализация запросов в консоли */
  verbose: boolean;

  /** Флаги, включающие особенные фичи */
  flags?: string[];

  /** HTTPS Agent, который прокидывается в Axios клиент */
  httpsAgent?: any;

  /** Включает работу библиотеку в браузере */
  dangerouslyAllowBrowser?: boolean;
}

function getDefaultSettings(): Settings {
  const BASE_URL = process?.env[`${ENV_PREFIX}BASE_URL`] || 'https://gigachat.devices.sberbank.ru/api/v1';
  const AUTH_URL =
    process?.env[`${ENV_PREFIX}AUTH_URL`] || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
  const SCOPE = process?.env[`${ENV_PREFIX}SCOPE`] || 'GIGACHAT_API_PERS';
  return {
    baseUrl: BASE_URL,
    authUrl: AUTH_URL,
    scope: SCOPE,
    timeout: parseFloat(process?.env[`${ENV_PREFIX}TIMEOUT`] || '30.0'),
    verbose: process?.env[`${ENV_PREFIX}VERBOSE`] === 'true',
    credentials: process?.env[`${ENV_PREFIX}CREDENTIALS`] || undefined,
    accessToken: process?.env[`${ENV_PREFIX}ACCESS_TOKEN`] || undefined,
    model: process?.env[`${ENV_PREFIX}MODEL`] || undefined,
    profanityCheck: process?.env[`${ENV_PREFIX}PROFANITY_CHECK`] === 'true',
    user: process?.env[`${ENV_PREFIX}USER`] || undefined,
    password: process?.env[`${ENV_PREFIX}PASSWORD`] || undefined,
    keyPassword: process?.env[`${ENV_PREFIX}KEY_PASSWORD`] || undefined,
    flags: process?.env[`${ENV_PREFIX}FLAGS`] ? process.env[`${ENV_PREFIX}FLAGS`]?.split(',') : undefined,
  } as Settings;
}

export type { Settings };

export { getDefaultSettings, ENV_PREFIX };
