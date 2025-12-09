import type { ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';
import Episodes from '../db/entities/Episodes';

export default class GetShow extends BaseAction<MainDB, MainClient> {
  constructor(mod: ICoreAnyModule) {
    super('get-show', mod);
    this.handler = this.handler.bind(this);
  }

  async handler({ args: showId }: XActionEvent<string>) {
    this.log(`action${this.channel}`, showId);

    const client = this.getModule().getClient();
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

      // Update Entry
      if (dbEpisode) {
        // Update episode_name
        if (dbEpisode.episode_name !== episode.episode_name) {
          this.log(
            'Updating episode name',
            dbEpisode.episode_name,
            episode.episode_name
          );
          await db.episodes.updateObject(dbEpisode.e_id, {
            episode_name: episode.episode_name,
          });
        }

        // Update episode_meta
        if (!('externalEpId' in dbEpisode.episode_meta)) {
          this.log(
            'Updating episode meta externalEpId',
            episode.episode_meta.externalEpId
          );
          await db.episodes.updateObject(dbEpisode.e_id, {
            episode_meta: { externalEpId: episode.episode_meta.externalEpId },
          });
        }
      } else {
        // Create Entry
        this.log('Adding Episode', episode);
        await db.episodes.createObject(
          new Episodes({
            show_id: dbShow.e_id,
            season_number: episode.season_number,
            episode_number: episode.episode_number,
            episode_name: episode.episode_name,
            episode_description: null,
            episode_meta: episode.episode_meta,
            createdAt: new Date(),
          })
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
