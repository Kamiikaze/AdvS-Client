import type { IKernel } from '@grandlinex/e-kernel';
import {
  BaseKernelModule,
  InMemCache,
  StoreGlobal,
} from '@grandlinex/e-kernel';
import { ElectronBlocker } from '@ghostery/adblocker-electron';
import fetch from 'cross-fetch';
import path from 'node:path';
import { app, session } from 'electron';
import { promises as fs } from 'node:fs';
import GetShowList from './action/GetShowList';
import MainDB from './db/MainDB';
import ShowListUpdater from './services/showListUpdater';
import MainClient from './client/MainClient';
import GetShow from './action/GetShow';
import GetEpisodeDetails from './action/GetEpisodeDetails';
import GetVersion from './action/GetVersion';
import GetStreamUrl from './action/GetStreamUrl';
import DesktopShortCut from './action/DesktopShortCut';
import SetWatchHistory from './action/SetWatchHistory';
import GetWatchHistory from './action/GetWatchHistory';
import checkUpdate from '../../util/UpdateChecker';
import GetLinkedAccounts from './action/GetLinkedAccounts';
import SetLinkedAccount from './action/SetLinkedAccounts';
import CheckAccountLinking from './services/checkAccountLinking';
import SetExternalEpisodeState from './action/SetExternalEpisodeState';
import SetDiscordRPC from './action/SetDiscordRPC';

export default class MainModule extends BaseKernelModule<
  MainDB,
  MainClient,
  InMemCache
> {
  constructor(kernel: IKernel) {
    super('main', kernel);

    // Actions
    this.addAction(
      new GetShowList(this),
      new GetShow(this),
      new GetEpisodeDetails(this),
      new GetStreamUrl(this),

      new GetWatchHistory(this),
      new SetWatchHistory(this),

      new GetLinkedAccounts(this),
      new SetLinkedAccount(this),
      new SetExternalEpisodeState(this),

      new SetDiscordRPC(this),

      new GetVersion(this),
      new DesktopShortCut(this)
    );

    // Services
    this.addService(new ShowListUpdater(this));
    this.addService(new CheckAccountLinking(this));
  }

  async initModule(): Promise<void> {
    this.setCache(new InMemCache(this));
    this.setDb(new MainDB(this));
    this.setClient(new MainClient(this));
  }

  async start() {
    this.getClient().updatePreloadMsg('Starting...');

    const store = this.getKernel().getConfigStore();
    await this.getClient().attachElectronBlocker(session.defaultSession);

    if (!this.getKernel().getDevMode()) {
      this.getClient().updatePreloadMsg('Checking for Updates...');
      await checkUpdate(
        this,
        app.getVersion(),
        store.get(StoreGlobal.GLOBAL_PATH_TEMP)!,
        'update.exe'
      );
    }
  }

  async final() {
    await this.getKernel().triggerEvent('show-list-updater');
    await this.getKernel().triggerEvent('check-account-linking');

    this.getClient().updatePreloadMsg('Launching App...');
  }
}
