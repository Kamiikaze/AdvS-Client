import type { ICoreAnyModule } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import { app } from 'electron';
import type MainDB from '../db/MainDB';
import { getLatestVeresion, VersionMatcher } from '../../../util/UpdateChecker';

export default class GetVersion extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-version', mod);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    this.log(`Action:${this.channel}`);

    const latestVersion = await getLatestVeresion();
    const updateAvailable = VersionMatcher(app.getVersion(), latestVersion);

    return {
      currentVersion: app.getVersion(),
      latestVersion,
      updateAvailable,
    };
  }
}
