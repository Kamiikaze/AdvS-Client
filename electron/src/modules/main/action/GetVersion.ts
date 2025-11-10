import { BaseAction, ICoreAnyModule } from '@grandlinex/e-kernel';
import { app } from 'electron';
import MainDB from '../db/MainDB';

export default class GetVersion extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-version', mod);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    return app.getVersion();
  }
}
