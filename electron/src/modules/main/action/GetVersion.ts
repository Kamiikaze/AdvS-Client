import { BaseAction, ICoreAnyModule } from '@grandlinex/e-kernel';
import { app } from 'electron';
import MainDB from '../db/MainDB';
import { getLatestVeresion, VersionMatcher } from '../../../util/UpdateChecker';

export default class GetVersion extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-version', mod);
    this.handler = this.handler.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  async handler() {
    const latestVersion = await getLatestVeresion();
    const updateAvailable = VersionMatcher(app.getVersion(), latestVersion);

    return {
      currentVersion: app.getVersion(),
      latestVersion,
      updateAvailable,
    };
  }
}
