import type { ICoreAnyModule, IKernel } from '@grandlinex/e-kernel';
import { CoreTriggerService } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';
import ShowList from '../db/entities/ShowList';

export default class ShowListUpdater extends CoreTriggerService<
  IKernel,
  MainDB,
  MainClient
> {
  constructor(mod: ICoreAnyModule) {
    super('show-list-updater', 'show-list-updater', mod, true);
  }

  async start(): Promise<void> {
    this.log('show-list-updater started');
    const client = this.getModule().getClient();
    const db = this.getModule().getDb();
    await db.setConfig('show_list_update', new Date().toISOString());
    client.updatePreloadMsg('Starting...');

    client.updatePreloadMsg('Fetching Animes...');
    const animes = await client.fetchShowList('anime');
    this.log('Animes found:', animes.length);

    client.updatePreloadMsg('Fetching Series...');
    const series = await client.fetchShowList('serie');
    this.log('Series found:', series.length);

    const showList = [...animes, ...series];

    client.updatePreloadMsg('Updating Shows Database...');
    this.log('Adding shows to database');
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, show] of showList.entries()) {
      client.updatePreloadMsg(
        `Updating Show ${index + 1} / ${showList.length}`,
      );

      const exists = await db.showList.findObj({
        show_slug: show.slug,
        show_type: show.type,
      });

      if (!exists) {
        await db.showList.createObject(
          new ShowList({
            show_name: show.name,
            show_slug: show.slug,
            show_start_year: null,
            show_type: show.type,
            show_category: show.genre,
            show_end_year: null,
            show_meta: show.meta,
            createdAt: new Date(),
            updatedAt: null,
          }),
        );
      }
    }
    client.updatePreloadMsg('Complete.');
    client.updatePreloadMsg('Launching App...');
    this.log('Done');
  }

  stop(): Promise<undefined> {
    this.log('show-list-updater stopped');
    return Promise.resolve(undefined);
  }
}
