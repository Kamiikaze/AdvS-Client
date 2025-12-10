import type { ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type { WatchHistoryItem } from '../db/entities/WatchHistory';
import WatchHistory from '../db/entities/WatchHistory';

export default class SetWatchHistory extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('set-watch-history', mod);
    this.handler = this.handler.bind(this);
  }

  async handler({ args: historyItem }: XActionEvent<WatchHistoryItem>) {
    this.log(`action:${this.channel}`, historyItem);

    const db = this.getModule().getDb();

    const exists = await db.watchHistory.findObj({
      episode_id: historyItem.episode_id,
    });
    if (exists) {
      this.log('Updating watch history entry', exists);
      await db.watchHistory.updateObject(exists.e_id, {
        progressSeconds: historyItem.progressSeconds,
        progressPercent: historyItem.progressPercent,
        updatedAt: new Date(),
      });
    } else {
      this.log('Creating new watch history entry', historyItem);
      await db.watchHistory.createObject(
        new WatchHistory({
          show_id: historyItem.show_id,
          episode_id: historyItem.episode_id,
          progressSeconds: historyItem.progressSeconds,
          progressPercent: historyItem.progressPercent,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
    }
  }
}
