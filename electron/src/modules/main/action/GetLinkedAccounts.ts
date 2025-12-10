import type { ICoreAnyModule } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';

export default class GetLinkedAccounts extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-linked-accounts', mod);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    this.log(`action:${this.channel}`);

    const db = this.getModule().getDb();
    return db.linkedAccounts.getObjList();
  }
}
