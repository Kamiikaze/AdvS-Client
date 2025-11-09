import { BaseAction, ICoreAnyModule, IKernel } from '@grandlinex/e-kernel';
import MainDB from '../db/MainDB';
import MainClient from '../client/MainClient';
import Episodes from '../db/entities/Episodes';

export default class GetShow extends BaseAction<IKernel, MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-show', mod);
    this.handler = this.handler.bind(this);
  }

  async handler(
    event: Electron.CrossProcessExports.IpcMainInvokeEvent,
    showId: string,
  ) {
    this.log('GetShow', showId);
    const client = this.getModule().getClient() as MainClient;
    const db = this.getModule().getDb();

    const dbShow = await db.showList.getObjById(showId);

    if (!dbShow) {
      this.error('Show not found', showId);
      return [];
    }

    const fetchedShow = await client.fetchShowDetails(dbShow);

    if (!fetchedShow) {
      this.error('Failed to fetch show details', showId);
      return [];
    }

    // update
    this.log('Updating show details', dbShow.e_id);
    await db.showList.updateObject(dbShow.e_id, {
      show_start_year: fetchedShow.startYear,
      show_end_year: fetchedShow.endYear,
      show_meta: {
        ...dbShow.show_meta,
        imdbId: fetchedShow.imdbId,
      },
      updatedAt: new Date(),
    });

    this.log('Episodes found', fetchedShow.episodes.length);
    // eslint-disable-next-line no-restricted-syntax
    for (const episode of fetchedShow.episodes) {
      const dbEpisode = await db.episodes.findObj({
        show_id: dbShow.e_id,
        season_number: episode.season_number,
        episode_number: episode.episode_number,
      });

      if (dbEpisode) {
        if (dbEpisode.episode_name !== episode.episode_name) {
          // update
          this.log(
            'Updating episode name',
            dbEpisode.episode_name,
            episode.episode_name,
          );
          await db.episodes.updateObject(dbEpisode.e_id, {
            episode_name: episode.episode_name,
          });
        }
      } else {
        // create
        this.log('Adding Episode', episode);
        await db.episodes.createObject(
          new Episodes({
            show_id: dbShow.e_id,
            season_number: episode.season_number,
            episode_number: episode.episode_number,
            episode_name: episode.episode_name,
            episode_description: null,
            createdAt: new Date(),
          }),
        );
      }
    }

    const updatedShow = await db.showList.getObjById(dbShow.e_id);
    const episodeList = await db.episodes.getObjList({
      search: {
        show_id: dbShow.e_id,
      },
      order: [
        {
          key: 'season_number',
          order: 'ASC',
        },
        {
          key: 'episode_number',
          order: 'ASC',
        },
      ],
    });

    return [updatedShow, episodeList];
  }
}
