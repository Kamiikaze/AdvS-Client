import { CoreDBUpdate } from '@grandlinex/e-kernel';
import type SQLCon from '@grandlinex/bundle-sqlight';
import LinkedAccounts, { AccountStatus } from '../entities/LinkedAccounts';
import providerlist from '../../static/providerList';

export default class Patch001 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('0', '1', db);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const la = db.getEntityWrapper<LinkedAccounts>('LinkedAccounts')!;
    const init = await la.init();

    for (const pr of providerlist) {
      await la.createObject(
        new LinkedAccounts({
          provider: pr.name,
          token: null,
          meta: {},
          status: AccountStatus.NOT_SYNCED,
          updatedAt: Date.now(),
        })
      );
    }

    await db.execScripts([
      {
        exec: `ALTER TABLE episodes ADD episode_meta TEXT NOT NULL DEFAULT '{}'`,
        param: [],
      },
    ]);

    return init;
  }
}
