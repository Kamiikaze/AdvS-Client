import SQLCon from '@grandlinex/bundle-sqlight';
import { CoreEntityWrapper, ICoreAnyModule } from '@grandlinex/e-kernel';
import ShowList from './entities/ShowList';
import Episodes from './entities/Episodes';
import EpisodeHosters from './entities/EpisodeHosters';
import WatchHistory from './entities/WatchHistory';

export default class MainDB extends SQLCon {
  showList: CoreEntityWrapper<ShowList>;

  episodes: CoreEntityWrapper<Episodes>;

  episodeHosters: CoreEntityWrapper<EpisodeHosters>;

  watchHistory: CoreEntityWrapper<WatchHistory>;

  constructor(mod: ICoreAnyModule) {
    super(mod, '0');
    this.showList = this.registerEntity(new ShowList());
    this.episodes = this.registerEntity(new Episodes());
    this.episodeHosters = this.registerEntity(new EpisodeHosters());
    this.watchHistory = this.registerEntity(new WatchHistory());

    // this.setConfig()
    // this.db?.prepare('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)');
  }
}
