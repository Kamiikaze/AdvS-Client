import type { ICoreAnyModule } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';

export default class GetWatchHistory extends BaseAction<MainDB, MainClient> {
  constructor(mod: ICoreAnyModule) {
    super('get-watch-history', mod);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    this.log(`action${this.channel}`);

    const client = this.getModule().getClient();
    const db = this.getModule().getDb();

    const dbHistory = await db.watchHistory.getObjList({
      order: [{ key: 'updatedAt', order: 'DESC' }],
    });

    if (dbHistory.length === 0) {
      this.error('No watch history entries found');
      return [];
    }

    const filteredHistory = await client.filterWatchHistoryByShow(dbHistory);
    this.log('Filtered History', filteredHistory.length, filteredHistory);

    return filteredHistory;
  }
}
