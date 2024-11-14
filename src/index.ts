import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';

import { AuthenticationError } from './exceptions';
import {
  get_image,
  get_model,
  get_models,
  post_auth,
  post_chat,
  post_embeddings,
  post_files,
  post_token,
  post_tokens_count,
  stream_chat,
} from './api';
import {
  AccessToken,
  Chat,
  ChatCompletion,
  ChatCompletionChunk,
  Embeddings,
  Image,
  MessageRole,
  Model,
  Models,
  Token,
  TokensCount,
  UploadedFile,
} from './interfaces';
import { getDefaultSettings, Settings } from './settings';

const GIGACHAT_MODEL = 'GigaChat';

interface BaseClientConfig {
  /** Адрес относительно которого выполняются запросы */
  baseUrl?: string;
  /** Адрес для запроса токена доступа OAuth 2.0 */
  authUrl?: string;
  /** Авторизационные данные */
  credentials?: string;
  /** Версия API, к которой предоставляется доступ */
  scope?: string;
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
  timeout?: number;
  /** Проверка SSL-сертификатов */
  verifySslCerts?: boolean;
  /** Детализация запросов в консоли */
  verbose?: boolean;
  /** CA-бандл */
  caBundle?: string | Buffer | Array<string | Buffer>;
  /** Сертификат */
  cert?: string | Buffer | Array<string | Buffer>;
  /** SSL ключ */
  key?: string | Buffer | Array<string | Buffer>;
  /** Пароль для SSL ключа */
  keyPassword?: string;
  /** Флаги, включающие особенные фичи */
  flags?: string[];
  /** HTTPS Agent, который прокидывается в Axios клиент */
  httpsAgent?: any;
}

class GigaChat {
  public _client: AxiosInstance;
  public _authClient: AxiosInstance;
  public _settings: Settings;
  protected _accessToken?: AccessToken;

  constructor(config: BaseClientConfig) {
    this._settings = { ...getDefaultSettings(), ...config } as Settings;

    if (this._settings.accessToken) {
      this._accessToken = {
        access_token: this._settings.accessToken,
        expires_at: 0,
      };
    }
    this._client = axios.create(this._getAxiosConfig());
    this._authClient = axios.create(this._getAuthAxiosConfig());

    if (this._settings.accessToken) {
      this._accessToken = {
        access_token: this._settings.accessToken,
        expires_at: 0,
      };
    }
  }

  protected get token(): string | undefined {
    return this._accessToken?.access_token;
  }

  protected get useAuth(): boolean {
    return Boolean(this._settings.credentials || (this._settings.user && this._settings.password));
  }

  protected checkValidityToken(): boolean {
    /** Проверить время завершения действия токена */
    return !!this._accessToken;
  }

  protected resetToken(): void {
    /** Сбросить токен */
    this._accessToken = undefined;
  }

  protected parseChat(payload: Chat | Record<string, any> | string): Chat {
    let chat: Chat;
    if (typeof payload === 'string') {
      chat = {
        messages: [{ role: MessageRole.USER, content: payload }],
      };
    } else {
      chat = payload as Chat;
    }

    chat.model = chat.model ?? this._settings.model ?? GIGACHAT_MODEL;
    chat.profanity_check = chat.profanity_check ?? this._settings.profanityCheck;
    chat.flags = chat.flags ?? this._settings.flags;
    return chat;
  }

  private _getHttpsAgent() {
    const https = require('node:https');
    const httpsAgent = new https.Agent({ rejectUnauthorized: this._settings.verifySslCerts });
    if (this._settings.caBundle) {
      httpsAgent.options.ca = this._settings.caBundle;
    }
    if (this._settings.cert) {
      httpsAgent.options.cert = this._settings.cert;
      httpsAgent.options.key = this._settings.key;
      httpsAgent.options.passphrase = this._settings.keyPassword;
    }
    return httpsAgent;
  }

  private _getAxiosConfig() {
    const notBrowser = typeof window === 'undefined' && typeof require !== 'undefined';
    const config: any = {
      baseURL: this._settings.baseUrl,
      timeout: this._settings.timeout * 1000,
      httpsAgent: notBrowser ? this._settings.httpsAgent || this._getHttpsAgent() : null,
    };
    return config;
  }

  private _getAuthAxiosConfig() {
    const notBrowser = typeof window === 'undefined' && typeof require !== 'undefined';
    const config: CreateAxiosDefaults = {
      httpsAgent: notBrowser ? this._settings.httpsAgent || this._getHttpsAgent() : null,
      timeout: this._settings.timeout * 1000,
    };
    return config;
  }

  public async updateToken(): Promise<void> {
    // if (authorization_cvar.get() !== undefined) {
    //     return;
    // }
    if (this._settings.credentials) {
      this._accessToken = await post_auth(this._authClient, {
        url: this._settings.authUrl,
        credentials: this._settings.credentials,
        scope: this._settings.scope,
      });
      console.info('OAUTH UPDATE TOKEN');
    } else if (this._settings.user && this._settings.password) {
      const token = await post_token(this._client, {
        user: this._settings.user,
        password: this._settings.password,
      });
      this._accessToken = this._buildAccessToken(token);
      console.info('UPDATE TOKEN');
    }
  }

  private async _decorator<T>(call: () => Promise<T>): Promise<T> {
    if (this.useAuth) {
      if (this.checkValidityToken()) {
        try {
          return await call();
        } catch (error) {
          if (error instanceof AuthenticationError) {
            console.warn('AUTHENTICATION ERROR');
            this.resetToken();
          } else {
            throw error;
          }
        }
      }
      await this.updateToken();
    }
    return await call();
  }

  public async tokensCount(input: string[], model?: string): Promise<TokensCount[]> {
    if (!model) {
      model = this._settings.model || GIGACHAT_MODEL;
    }
    return this._decorator(() =>
      post_tokens_count(this._client, {
        input,
        model: model || this._settings.model || GIGACHAT_MODEL,
        accessToken: this.token,
      }),
    );
  }

  public async embeddings(texts: string[], model: string = 'Embeddings'): Promise<Embeddings> {
    return this._decorator(() =>
      post_embeddings(this._client, {
        accessToken: this.token,
        input: texts,
        model,
      }),
    );
  }

  public async getModels(): Promise<Models> {
    return this._decorator(() => get_models(this._client, { accessToken: this.token }));
  }

  public async getModel(model: string): Promise<Model> {
    return this._decorator(() =>
      get_model(this._client, {
        model,
        accessToken: this.token,
      }),
    );
  }

  public async getImage(fileId: string): Promise<Image> {
    return this._decorator(() =>
      get_image(this._client, {
        fileId,
        accessToken: this.token,
      }),
    );
  }

  public async uploadFile(file: File, purpose: 'general' | 'assistant' = 'general'): Promise<UploadedFile> {
    return this._decorator(() => post_files(this._client, { file, purpose, accessToken: this.token }));
  }

  public async chat(payload: Chat | Record<string, any> | string): Promise<ChatCompletion> {
    const chat = this.parseChat(payload);
    return this._decorator(() =>
      post_chat(this._client, {
        chat,
        accessToken: this.token,
      }),
    );
  }

  public async *stream(payload: Chat | Record<string, any> | string): AsyncIterable<ChatCompletionChunk> {
    const chat = this.parseChat(payload);

    if (this.useAuth) {
      if (this.checkValidityToken()) {
        try {
          for await (const chunk of stream_chat(this._client, { chat, accessToken: this.token })) {
            yield chunk;
          }
          return;
        } catch (error) {
          if (error instanceof AuthenticationError) {
            console.warn('AUTHENTICATION ERROR');
            this.resetToken();
          } else {
            throw error;
          }
        }
      }
      await this.updateToken();
    }

    for await (const chunk of stream_chat(this._client, { chat, accessToken: this.token })) {
      yield chunk;
    }
  }

  private _buildAccessToken(token: Token): AccessToken {
    return {
      access_token: token.tok,
      expires_at: token.exp,
    };
  }
}

export default GigaChat;
