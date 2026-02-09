import { CoreDBUpdate } from '@grandlinex/e-kernel';
import type SQLCon from '@grandlinex/bundle-sqlight';
import CloneDB from '../../class/CloneDB';

export default class Patch003 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('2', '3', db);
  }

  async performe(): Promise<boolean> {
    await CloneDB.clone(this);

    console.log('Initial DB backup completed');

    return true;
  }
}
