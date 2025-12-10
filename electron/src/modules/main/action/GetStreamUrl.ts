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
    this.log(`action:${this.channel}`, args);

    const db = this.getModule().getDb();
    const episodeHoster = await db.episodeHosters.getObjById(
      args.episodeHosterId
    );

    if (!episodeHoster) {
      this.error('Episode Host not found', args.episodeHosterId);
      return null;
    }

    // Check if Hoster was already resolved in the last 6h
    // This caches the url and prevent refetching the same url with each call
    if (episodeHoster.hoster_resolved && episodeHoster.resolvedAt) {
      const sixHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 6);

      // Return cached Url if no 'refreshCache' flag is set
      if (!args.refreshCache && episodeHoster.resolvedAt > sixHoursAgo) {
        this.log('Using cached streamUrl', episodeHoster.hoster_resolved);
        return episodeHoster.hoster_resolved;
      }

      // Reset the resolvedAt date to force re-resolution
      this.log('Cached streamUrl is older than 6 hours, resolving again');
      await db.episodeHosters.updateObject(episodeHoster.e_id, {
        resolvedAt: null,
      });
      episodeHoster.resolvedAt = null; // Update in memory as well
      this.log('Reset resolvedAt for re-resolution');
    }

    // Call scraperWindow to fetch Url
    const streamUrl = await scraperWindow(episodeHoster, this);

    if (streamUrl?.mediaLink) {
      this.log('StreamUrl found', streamUrl);
      await db.episodeHosters.updateObject(episodeHoster.e_id, {
        hoster_resolved: streamUrl,
        resolvedAt: new Date(),
      });

      return streamUrl;
    }

    this.error('StreamUrl not found', episodeHoster);
    return null;
  }
}
