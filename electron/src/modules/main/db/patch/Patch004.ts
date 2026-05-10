import { CoreDBUpdate } from '@grandlinex/e-kernel';
import type SQLCon from '@grandlinex/bundle-sqlight';
import CloneDB from '../../class/CloneDB';

export default class Patch004 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('3', '4', db);
  }

  async performe(): Promise<boolean> {
    await CloneDB.clone(this);
    const db = this.getDb();

    await db.execScripts([
      {
        exec: `DROP TABLE IF EXISTS main.linked_accounts`,
        param: [],
      },
    ]);

    console.log('Initial DB backup completed');

    return true;
  }
}
