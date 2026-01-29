import { CoreDBUpdate } from '@grandlinex/e-kernel';
import type SQLCon from '@grandlinex/bundle-sqlight';
import type ShowList from '../entities/ShowList';

export default class Patch002 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('1', '2', db);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    const sl = db.getEntityWrapper<ShowList>('ShowList')!;

    const shows = await sl.getObjList();

    const invalid = shows.filter(
      (show) =>
        Object.keys(show.show_meta).length === 0 ||
        !Object.hasOwn(show.show_meta, 'alternativeTitles')
    );

    await Promise.all(
      invalid.map(async (inv) => {
        console.log('Removing invalid Entry', inv);
        await sl.delete(inv.e_id);
      })
    );

    return true;
  }
}
