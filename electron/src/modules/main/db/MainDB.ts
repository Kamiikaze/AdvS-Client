import SQLCon from '@grandlinex/bundle-sqlight';
import type { CoreEntityWrapper, ICoreAnyModule } from '@grandlinex/e-kernel';
import ShowList from './entities/ShowList';
import Episodes from './entities/Episodes';
import EpisodeHosters from './entities/EpisodeHosters';
import WatchHistory from './entities/WatchHistory';
import LinkedAccounts from './entities/LinkedAccounts';
import Patch001 from './patch/Patch001';

export default class MainDB extends SQLCon {
  showList: CoreEntityWrapper<ShowList>;

  episodes: CoreEntityWrapper<Episodes>;

  episodeHosters: CoreEntityWrapper<EpisodeHosters>;

  watchHistory: CoreEntityWrapper<WatchHistory>;

  linkedAccounts: CoreEntityWrapper<LinkedAccounts>;

  constructor(mod: ICoreAnyModule) {
    super(mod, '1');
    this.showList = this.registerEntity(new ShowList());
    this.episodes = this.registerEntity(new Episodes());
    this.episodeHosters = this.registerEntity(new EpisodeHosters());
    this.watchHistory = this.registerEntity(new WatchHistory());
    this.linkedAccounts = this.registerEntity(new LinkedAccounts());

    this.setUpdateChain(new Patch001(this));
    // this.setConfig()
    // this.db?.prepare('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
  }
}
