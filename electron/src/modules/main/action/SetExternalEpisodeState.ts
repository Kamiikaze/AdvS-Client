import type { ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import StoProvider from '../class/StoProvider';
import AniworldProvider from '../class/AniworldProvider';
import type MainClient from '../client/MainClient';

export default class SetExternalEpisodeState extends BaseAction<
  MainDB,
  MainClient
> {
  constructor(mod: ICoreAnyModule) {
    super('set-external-epsiode-state', mod);
    this.handler = this.handler.bind(this);
  }

  async handler({
    args,
  }: XActionEvent<{
    providerName: string;
    episodeId: string;
  }>) {
    this.log('Updating Episode:', args.providerName, args.episodeId);

    const db = this.getModule().getDb();
    const client = this.getModule().getClient();

    const linkedAccount = (await db.linkedAccounts.findObj({
      provider: args.providerName,
    }))!;
    const token = (await client.getAccountToken(linkedAccount))!;

    this.log('linkedAccount', linkedAccount);

    if (linkedAccount.provider === 'sto') {
      const provider = new StoProvider(this.getModule());
      await provider.setToken(token);
      return provider.setEpisodeStatus(args.episodeId);
    }

    if (linkedAccount.provider === 'aniworld') {
      const provider = new AniworldProvider(this.getModule());
      await provider.setToken(token);
      return provider.setEpisodeStatus(args.episodeId);
    }

    return false;
  }
}
