import type { ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import { AccountStatus } from '../db/entities/LinkedAccounts';
import StoProvider from '../class/StoProvider';
import AniworldProvider from '../class/AniworldProvider';

export default class SetLinkedAccount extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('set-linked-account', mod);
    this.handler = this.handler.bind(this);
  }

  async handler({
    args,
  }: XActionEvent<{
    id: string;
    action: 'link' | 'unlink';
  }>) {
    this.log(`Action:${this.channel}`, args);

    const db = this.getModule().getDb();

    const linkedAccount = (await db.linkedAccounts.getObjById(args.id))!;

    if (args.action === 'unlink') {
      this.log('Unlinking provider', linkedAccount.provider);

      await db.linkedAccounts.updateObject(linkedAccount.e_id, {
        token: null,
        status: AccountStatus.NOT_SYNCED,
        meta: {},
      });
      return true;
    }

    // Linking Providers
    if (linkedAccount.provider === 'sto') {
      const provider = new StoProvider(this.getModule());
      return provider.startLink();
    }

    if (linkedAccount.provider === 'aniworld') {
      const provider = new AniworldProvider(this.getModule());
      return provider.startLink();
    }

    return false;
  }
}
