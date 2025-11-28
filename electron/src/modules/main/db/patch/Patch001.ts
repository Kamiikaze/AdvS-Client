import { CoreDBUpdate } from '@grandlinex/e-kernel';
import type SQLCon from '@grandlinex/bundle-sqlight';
import LinkedAccounts, { AccountStatus } from '../entities/LinkedAccounts';
import providerlist from '../../static/providerlist';

export default class Patch001 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('0', '1', db);
  }

  async performe(): Promise<boolean> {
    const la = this.getDb().getEntityWrapper<LinkedAccounts>('LinkedAccounts')!;
    const init = await la.init();

    for (const pr of providerlist) {
      await la.createObject(
        new LinkedAccounts({
          status: AccountStatus.NOT_SYNCED,
          updated: Date.now(),
          meta: {},
          provider: pr.name,
          token: null,
        }),
      );
    }

    return init;
  }
}
