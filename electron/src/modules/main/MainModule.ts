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

      new GetVersion(this),
      new DesktopShortCut(this),
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
    const store = this.getKernel().getConfigStore();
    const data = store.get(StoreGlobal.GLOBAL_PATH_DATA)!;
    const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch, {
      path: path.join(data, 'engine.bin'),
      read: async (...args) => (await fs.readFile(...args)) as any,
      write: async (...args) => fs.writeFile(...args),
    });
    blocker.enableBlockingInSession(session.defaultSession);
    this.log('ElectronBlocker: Enabled');

    blocker.on('request-blocked', (request) => {
      this.log(`ElectronBlocker: Blocked(${request.tabId})`, request.url);
    });

    if (!this.getKernel().getDevMode()) {
      await checkUpdate(
        this,
        app.getVersion(),
        store.get(StoreGlobal.GLOBAL_PATH_TEMP)!,
        'update.exe',
      );
    }
  }

  async final() {
    await this.getKernel().triggerEvent('show-list-updater');
    await this.getKernel().triggerEvent('check-account-linking');
  }
}
