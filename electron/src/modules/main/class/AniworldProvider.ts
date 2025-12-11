import type { IBaseKernelModule, InMemCache } from '@grandlinex/e-kernel';
import { BrowserWindow, session } from 'electron';
import { randomUUID } from 'crypto';
import BaseProvider from './BaseProvider';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';
import { axiosGet, axiosPost } from '../../../util/routedRequest';

const AniworldProviderConf = {
  sessionKey: 'aniworld_session',
  baseURL: 'https://aniworld.to',
  loginURL: 'https://aniworld.to/login',
};

export default class AniworldProvider extends BaseProvider {
  private conf: typeof AniworldProviderConf;

  private token: string | null = null;

  private endpoints = {
    setEpisodeStatus: '/ajax/watchEpisode',
    getNotifications: '/ajax/notifications',
  };

  constructor(
    mod: IBaseKernelModule<MainDB, MainClient, InMemCache>,
    name = 'aniworld',
    conf?: typeof AniworldProviderConf
  ) {
    super(name, mod);
    this.conf = conf || AniworldProviderConf;
  }

  async init() {
    const db = this.getModule().getDb();
    const client = this.getModule().getClient();

    this.log('Init provider');

    const linkedAccount = (await db.linkedAccounts.findObj({
      provider: this.getName().split(':')[1],
    }))!;
    const token = await client.getAccountToken(linkedAccount);

    if (token) {
      await this.setToken(token);
      this.log('Token set');
      return;
    }
    this.warn('No Token found');
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async testConnection(): Promise<boolean> {
    if (!this.token) {
      this.warn(`No token set for ${this.providerName}`);
      return false;
    }
    const req = await axiosGet(
      this.conf.baseURL + this.endpoints.getNotifications,
      {
        headers: {
          Cookie: `${this.conf.sessionKey}=${this.token}`,
        },
      }
    );
    if (!req) return false;
    const { status, data } = req;
    return status === 200 && data?.error !== 1;
  }

  async startLink(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const window = this.getKernel()
        .getWindowManager()
        .create(`${this.providerName}-link`, (iwp) => {
          return new BrowserWindow({
            ...iwp,
            width: 990,
            webPreferences: {
              session: session.fromPartition(randomUUID()),
            },
          });
        });

      let timeoutId: NodeJS.Timeout;
      let resolved = false;

      // Helper to resolve once
      const resolveOnce = (success: boolean) => {
        if (resolved) return;
        resolved = true;

        clearTimeout(timeoutId);

        if (success) {
          resolve(success);
        } else {
          reject(success);
        }

        window.close();
      };

      window.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' }; // blockt alle neuen Fenster
      });

      window.webContents.session.webRequest.onSendHeaders((details) => {
        if (details.url.includes(this.conf.baseURL)) {
          if (details.requestHeaders.Cookie) {
            const cookies = details.requestHeaders.Cookie.split(';').map((e) =>
              e.trim().split('=')
            );
            const loginCookie = cookies.find(
              ([key]) => key === this.conf.sessionKey
            );
            const isLogin = cookies.some(([key]) => key === 'rememberLogin');

            if (loginCookie && isLogin) {
              this.log('Got session cookie:', loginCookie[1]);
              [, this.token] = loginCookie;

              this.testConnection()
                .then((isValid) => {
                  if (isValid) {
                    this.log('Token valid');
                    this.saveToken(loginCookie[1]);
                    resolveOnce(true);
                  }

                  this.warn('Token invalid');
                  resolveOnce(false);
                })
                .catch((error) => {
                  this.error('Token test failed:', error);
                  resolveOnce(false);
                });
            }
          }
        }
      });

      // Handle manual window closure by user
      window.on('close', () => {
        resolveOnce(false);
      });

      // Set timeout
      timeoutId = setTimeout(
        () => {
          this.error('Login timeout reached. No response received!');
          resolveOnce(false);
        },
        1000 * 60 * 5
      );

      // Load URL
      window.loadURL(this.conf.loginURL).catch((error) => {
        this.error('Failed to load login URL:', error);
        resolveOnce(false);
      });
    });
  }

  async setEpisodeStatus(externalId: string) {
    const apiCall = () => {
      return axiosPost(
        this.conf.baseURL + this.endpoints.setEpisodeStatus,
        `episode=${externalId}`,
        {
          headers: {
            Cookie: `${this.conf.sessionKey}=${this.token}`,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        }
      );
    };
    const result = await apiCall();

    if (!result || !result.data) {
      this.error('Failed to set episode status', result);
      return;
    }

    if (result.data?.status) {
      this.log('Episode status set successfully', result.data.status);
    } else {
      this.warn('Already watched. Recalling apiCall to set as seen again.');
      await apiCall();
    }
  }
}
