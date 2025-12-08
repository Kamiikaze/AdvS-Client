import type { ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import scraperWindow from '../../../window/scraperWindow';
import type { ScraperLink } from '../lib';
import type MainClient from '../client/MainClient';

export default class GetStreamUrl extends BaseAction<MainDB, MainClient> {
  constructor(mod: ICoreAnyModule) {
    super('get-stream-url', mod);
    this.handler = this.handler.bind(this);
  }

  async handler({
    args,
  }: XActionEvent<{
    episodeHosterId: string;
    refreshCache: boolean;
  }>): Promise<ScraperLink | null> {
    const db = this.getModule().getDb();
    this.log('GetStreamUrl', args);
    const episodeHoster = await this.getModule()
      .getDb()
      .episodeHosters.getObjById(args.episodeHosterId);

    if (!episodeHoster) {
      this.log('Episode Host not found', args.episodeHosterId);
      return null;
    }

    if (episodeHoster.hoster_resolved && episodeHoster.resolvedAt) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      if (!args.refreshCache && episodeHoster.resolvedAt > sixHoursAgo) {
        this.log('Using cached streamUrl', episodeHoster.hoster_resolved);
        return episodeHoster.hoster_resolved;
      }

      // Reset the resolvedAt date to null to force re-resolution
      this.log('Cached streamUrl is older than 6 hours, resolving again');
      await db.episodeHosters.updateObject(episodeHoster.e_id, {
        resolvedAt: null,
      });
      episodeHoster.resolvedAt = null; // Update in memory as well
      this.log('Reset resolvedAt for re-resolution');
    }

    const streamUrl = await scraperWindow(episodeHoster, this);

    if (streamUrl?.mediaLink) {
      await db.episodeHosters.updateObject(episodeHoster.e_id, {
        hoster_resolved: streamUrl,
        resolvedAt: new Date(),
      });
      this.log('StreamUrl found', streamUrl);

      return streamUrl;
    }

    this.log('StreamUrl not found', episodeHoster);
    return null;
  }
}
