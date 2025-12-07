import { CoreDBUpdate } from '@grandlinex/e-kernel';
import type SQLCon from '@grandlinex/bundle-sqlight';

export default class Patch002 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('1', '2', db);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();

    await db.execScripts([
      {
        exec: `ALTER TABLE episodes ADD episode_meta TEXT NOT NULL default '{}'`,
        param: [],
      },
    ]);

    return true;
  }
}
