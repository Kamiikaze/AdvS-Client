import { BaseAction, ICoreAnyModule, IKernel } from '@grandlinex/e-kernel';
import MainDB from '../db/MainDB';
import MainClient from '../client/MainClient';

export default class GetEpisodeDetails extends BaseAction<IKernel, MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('get-episode-details', mod);
    this.handler = this.handler.bind(this);
  }

  async handler(
    event: Electron.CrossProcessExports.IpcMainInvokeEvent,
    episodeId: string,
  ) {
    this.log('GetEpisodeDetails', episodeId);
    const client = this.getModule().getClient() as MainClient;
    const db = this.getModule().getDb();

    const dbEpisode = await db.episodes.getObjById(episodeId);

    if (!dbEpisode) {
      this.error('Episode not found', episodeId);
      return [];
    }

    // check if episode has already hosters
    const episodeHosterList = await db.episodeHosters.getObjList({
      search: {
        episode_id: dbEpisode.e_id,
      },
    });

    // ToDO: Fetch Details if hosterlist is present. need to update fetchEpisodeDetails

    if (episodeHosterList.length > 0) {
      this.log('Episode already has hosters', episodeHosterList[0].createdAt);
      // return { episodeDescription: null, hosterList: episodeHosterList };
    }

    // fetch episode details
    const fetchedEpisodeDetails = await client.fetchEpisodeDetails(dbEpisode);

    if (
      !fetchedEpisodeDetails ||
      fetchedEpisodeDetails.hosterList.length === 0
    ) {
      this.log('No hosters found');
      return [];
    }

    // compare hosters of episodeHosterList and fetchedEpisodeDetails.hosterList if url has changed and then update url
    // eslint-disable-next-line no-restricted-syntax
    for (const newHoster of fetchedEpisodeDetails.hosterList) {
      const existingHoster = episodeHosterList.find(
        (h) =>
          h.hoster_key === newHoster.hoster_key &&
          h.hoster_language === newHoster.hoster_language,
      );
      if (existingHoster) {
        if (existingHoster.hoster_redirect !== newHoster.hoster_redirect) {
          this.log(
            `Updating hoster URL for ${newHoster.hoster_label} (${newHoster.hoster_language})`,
          );
          this.log(
            `${existingHoster.hoster_redirect} => ${newHoster.hoster_redirect}`,
          );
          await db.episodeHosters
            .updateObject(existingHoster.e_id, {
              hoster_redirect: newHoster.hoster_redirect,
            })
            .catch((err) => {
              this.error('Error updating hoster URL', err);
            });
        }
      } else {
        this.log(
          `Adding new hoster ${newHoster.hoster_label} (${newHoster.hoster_language})`,
        );
        await db.episodeHosters.createObject(newHoster);
      }
    }

    if (!dbEpisode.episode_description) {
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
