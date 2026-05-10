import type { IKernel } from '@grandlinex/e-kernel';
import {
  BaseKernelModule,
  InMemCache,
  StoreGlobal,
} from '@grandlinex/e-kernel';
import { app, session } from 'electron';
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

      new SetDiscordRPC(this),

      new GetVersion(this),
      new DesktopShortCut(this)
    );

    // Services
    this.addService(new ShowListUpdater(this));
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

    this.getClient().updatePreloadMsg('Launching App...');
  }
}
