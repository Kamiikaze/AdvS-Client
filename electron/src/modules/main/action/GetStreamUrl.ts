import { BaseAction, ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import MainDB from '../db/MainDB';
import scraperWindow from '../../../window/scraperWindow';
import { ScraperLink } from '../lib';
import MainClient from '../client/MainClient';

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
    const episodeHosters = await this.getModule()
      .getDb()
      .episodeHosters.getObjById(args.episodeHosterId);

    if (!episodeHosters) {
      this.log('Episode Host not found', args.episodeHosterId);
      return null;
    }

    if (episodeHosters.hoster_resolved && episodeHosters.resolvedAt) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      if (!args.refreshCache && episodeHosters.resolvedAt > sixHoursAgo) {
        this.log('Using cached streamUrl', episodeHosters.hoster_resolved);
        return episodeHosters.hoster_resolved;
      }

      // Reset the resolvedAt date to null to force re-resolution
      this.log('Cached streamUrl is older than 6 hours, resolving again');
      await db.episodeHosters.updateObject(episodeHosters.e_id, {
        resolvedAt: null,
      });
      episodeHosters.resolvedAt = null; // Update in memory as well
      this.log('Reset resolvedAt for re-resolution');
    }

    const streamUrl = await scraperWindow(episodeHosters, this);

    if (streamUrl?.mediaLink) {
      await db.episodeHosters.updateObject(episodeHosters.e_id, {
        hoster_resolved: streamUrl,
        resolvedAt: new Date(),
      });
      this.log('StreamUrl found', streamUrl);

      return streamUrl;
    }

    this.log('StreamUrl not found', episodeHosters);
    return null;
  }
}
