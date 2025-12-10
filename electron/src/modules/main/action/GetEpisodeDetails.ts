import type { ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';

export default class GetEpisodeDetails extends BaseAction<MainDB, MainClient> {
  constructor(mod: ICoreAnyModule) {
    super('get-episode-details', mod);
    this.handler = this.handler.bind(this);
  }

  async handler({ args: episodeId }: XActionEvent<string>) {
    this.log(`action:${this.channel}`, episodeId);

    const db = this.getModule().getDb();
    const client = this.getModule().getClient();

    const dbEpisode = await db.episodes.getObjById(episodeId);

    if (!dbEpisode) {
      this.error('Episode not found in database', episodeId);
      return null;
    }

    // Check if episode has already hosters
    const episodeHosterList = await db.episodeHosters.getObjList({
      search: {
        episode_id: dbEpisode.e_id,
      },
    });

    if (episodeHosterList.length > 0) {
      this.log(
        'Episode already has hosters',
        episodeHosterList.length,
        episodeHosterList[0].createdAt
      );
    }

    // Fetch episode details
    const fetchedEpisodeDetails = await client.fetchEpisodeDetails(dbEpisode);

    if (!fetchedEpisodeDetails) {
      this.error('Fetch returned no data');
      return null;
    }

    // Compare hosters of db.hosterList and fetchedEpisodeDetails.hosterList
    // If redirect URL has changed, update URL
    if (
      fetchedEpisodeDetails.hosterList &&
      fetchedEpisodeDetails.hosterList?.length > 0
    ) {
      await Promise.all(
        fetchedEpisodeDetails.hosterList.map(async (newHoster) => {
          const existingHoster = episodeHosterList.find(
            (dbHost) =>
              dbHost.hoster_key === newHoster.hoster_key &&
              dbHost.hoster_language === newHoster.hoster_language
          );

          if (existingHoster) {
            if (existingHoster.hoster_redirect !== newHoster.hoster_redirect) {
              this.log(
                `Updating hoster URL for ${newHoster.hoster_label} (${newHoster.hoster_language})`
              );
              this.log(
                `${existingHoster.hoster_redirect} => ${newHoster.hoster_redirect}`
              );
              await db.episodeHosters
                .updateObject(existingHoster.e_id, {
                  hoster_redirect: newHoster.hoster_redirect,
                })
                .catch((err) => {
                  this.error('Error updating hoster URL', err);
                });
            } else {
              this.log('Hoster URL not changed');
            }
          } else {
            this.log(
              `Adding new hoster ${newHoster.hoster_label} (${newHoster.hoster_language})`
            );
            await db.episodeHosters.createObject(newHoster);
          }
        })
      );
    }

    // Update episode description if not set or has changed
    if (
      !dbEpisode.episode_description ||
      dbEpisode.episode_description !== fetchedEpisodeDetails.episodeDescription
    ) {
      this.log('Updating episode description');
      await db.episodes.updateObject(episodeId, {
        episode_description: fetchedEpisodeDetails.episodeDescription,
      });
    }

    fetchedEpisodeDetails.hosterList = await db.episodeHosters.getObjList({
      search: {
        episode_id: dbEpisode.e_id,
      },
    });

    return fetchedEpisodeDetails;
  }
}
