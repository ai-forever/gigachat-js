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
  Embeddings,
  Image,
  MessageRole,
  Model,
  Models,
  Token,
  TokensCount,
  UploadedFile,
} from './interfaces';
import { Readable } from 'stream';
import * as https from 'node:https';
import { getDefaultSettings, Settings } from 'gigachat/settings';

const GIGACHAT_MODEL = 'GigaChat';

interface BaseClientConfig {
  baseUrl?: string;
  authUrl?: string;
  credentials?: string;
  scope?: string;
  accessToken?: string;
  model?: string;
  profanityCheck?: boolean;
  user?: string;
  password?: string;
  timeout?: number;
  verifySslCerts?: boolean;
  verbose?: boolean;
  caBundleFile?: string;
  certFile?: string;
  keyFile?: string;
  keyFilePassword?: string;
  flags?: string[];
}

class GigaChatClient {
  public _client: AxiosInstance;
  public _authClient: AxiosInstance;
  public _settings: Settings;
  protected _accessToken?: AccessToken;

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

  private _getAxiosConfig() {
    const config: any = {
      baseURL: this._settings.baseUrl,
      timeout: this._settings.timeout * 1000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

    if (this._settings.caBundleFile) {
      config.httpsAgent = this._settings.caBundleFile;
    }
    if (this._settings.certFile) {
      config.httpsAgent = {
        cert: this._settings.certFile,
        key: this._settings.keyFile,
        passphrase: this._settings.keyFilePassword,
      };
    }
    return config;
  }

  private _getAuthAxiosConfig() {
    const config: CreateAxiosDefaults = {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: this._settings.timeout * 1000,
    };

    // if (this._settings.caBundleFile) {
    //     config.httpsAgent = this._settings.caBundleFile;
    // }
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

  public async stream(payload: Chat | Record<string, any> | string): Promise<Readable> {
    const chat = this.parseChat(payload);

    return this._decorator(() =>
      stream_chat(this._client, {
        chat,
        accessToken: this.token,
      }),
    );
  }

  private _buildAccessToken(token: Token): AccessToken {
    return {
      access_token: token.tok,
      expires_at: token.exp,
    };
  }
}

export { GigaChatClient };
