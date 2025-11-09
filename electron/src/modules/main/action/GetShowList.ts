import { BaseAction, ICoreAnyModule, IKernel } from '@grandlinex/e-kernel';
import MainDB from '../db/MainDB';

export default class GetShowList extends BaseAction<IKernel, MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-show-list', mod);
    this.handler = this.handler.bind(this);
  }

  async handler() {
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
