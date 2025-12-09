import type { ICoreAnyModule } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';

export default class GetShowList extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-show-list', mod);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    this.log(`Action:${this.channel}`);

    const db = this.getModule().getDb();
    return db.showList.getObjList({
      order: [
        {
          key: 'show_slug',
          order: 'ASC',
        },
      ],
    });
  }
}
