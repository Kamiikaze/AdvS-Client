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
    conf?: typeof AniworldProviderConf,
  ) {
    super(name, mod);
    this.conf = conf || AniworldProviderConf;
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
      },
    );
    if (!req) return false;
    const { status, data } = req;
    return status === 200 && data?.error !== 1;
  }

  async startLink(): Promise<void> {
    const window = this.getKernel()
      .getWindowManager()
      .create(`${this.providerName}-link`, (iwp) => {
        return new BrowserWindow({
          ...iwp,
          webPreferences: {
            session: session.fromPartition(randomUUID()),
          },
        });
      });

    window.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' }; // blockt alle neuen Fenster
    });
    window.webContents.session.webRequest.onSendHeaders((details) => {
      if (details.url.includes(this.conf.baseURL)) {
        // this.log(details);
        if (details.requestHeaders.Cookie) {
          const cookies = details.requestHeaders.Cookie.split(';').map((e) =>
            e.trim().split('='),
          );
          const season = cookies.find(([key]) => key === this.conf.sessionKey);
          const isLogin = cookies.some(([key]) => key === 'rememberLogin');
          if (season && isLogin) {
            this.log(`Got ${this.providerName} session cookie:`, season[1]);
            [, this.token] = season;
            this.testConnection().then((e) => {
              if (e) {
                this.warn('Token work');
                this.saveToken(season[1]);
              } else {
                this.warn("Token doesn't work");
              }
            });

            window.close();
          }
        }
      }
    });
    await window.loadURL(this.conf.loginURL);
  }

  private async setEpisodeStatus(externalId: string) {
    const result = await axiosPost(
      this.conf.baseURL + this.endpoints.setEpisodeStatus,
      externalId,
    );

    if (!result || !result.data) {
      this.error('Failed to set episode status', result);
      return;
    }

    if (result.data?.status) {
      this.log('Episode status set successfully');
    } else {
      this.warn('Already watched. Recalling func to set as seen again.');
      await this.setEpisodeStatus(externalId);
    }
  }
}
