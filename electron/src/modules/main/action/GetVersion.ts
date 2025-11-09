import { BaseAction, ICoreAnyModule, IKernel } from '@grandlinex/e-kernel';
import { app } from 'electron';
import MainDB from '../db/MainDB';

export default class GetVersion extends BaseAction<IKernel, MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-version', mod);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    return app.getVersion();
  }
}
