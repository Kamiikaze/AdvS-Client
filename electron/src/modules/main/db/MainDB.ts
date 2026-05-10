import SQLCon from '@grandlinex/bundle-sqlight';
import type { CoreEntityWrapper, ICoreAnyModule } from '@grandlinex/e-kernel';
import ShowList from './entities/ShowList';
import Episodes from './entities/Episodes';
import EpisodeHosters from './entities/EpisodeHosters';
import WatchHistory from './entities/WatchHistory';
import Patch001 from './patch/Patch001';
import Patch002 from './patch/Patch002';
import Patch003 from './patch/Patch003';
import Patch004 from './patch/Patch004';

export default class MainDB extends SQLCon {
  showList: CoreEntityWrapper<ShowList>;

  episodes: CoreEntityWrapper<Episodes>;

  episodeHosters: CoreEntityWrapper<EpisodeHosters>;

  watchHistory: CoreEntityWrapper<WatchHistory>;

  constructor(mod: ICoreAnyModule) {
    super(mod, '4');
    this.showList = this.registerEntity(new ShowList());
    this.episodes = this.registerEntity(new Episodes());
    this.episodeHosters = this.registerEntity(new EpisodeHosters());
    this.watchHistory = this.registerEntity(new WatchHistory());

    this.setUpdateChain(new Patch001(this));
    this.setUpdateChain(new Patch002(this));
    this.setUpdateChain(new Patch003(this));
    this.setUpdateChain(new Patch004(this));

    // this.setConfig()
    // this.db?.prepare('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
  }
}
