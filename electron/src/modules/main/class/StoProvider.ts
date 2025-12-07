import type { IBaseKernelModule, InMemCache } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';
import AniworldProvider from './AniworldProvider';

const StoProviderConf = {
  baseURL: 'https://s.to',
  loginURL: 'https://s.to/login',
  sessionKey: 'PHPSESSID',
  providerName: 'sto',
};

export default class StoProvider extends AniworldProvider {
  constructor(mod: IBaseKernelModule<MainDB, MainClient, InMemCache>) {
    super(mod, 'sto', StoProviderConf);
  }
}
