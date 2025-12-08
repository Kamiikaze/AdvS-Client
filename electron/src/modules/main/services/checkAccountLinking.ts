import type { ICoreAnyModule, IKernel } from '@grandlinex/e-kernel';
import { CoreTriggerService } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';
import AniworldProvider from '../class/AniworldProvider';
import StoProvider from '../class/StoProvider';

export default class CheckAccountLinking extends CoreTriggerService<
  IKernel,
  MainDB,
  MainClient
> {
  constructor(mod: ICoreAnyModule) {
    super('check-account-linking', 'check-account-linking', mod, true);
  }

  async start(): Promise<void> {
    this.log('check-account-linking started');
    const client = this.getModule().getClient();
    const db = this.getModule().getDb();

    client.updatePreloadMsg('Checking linked Accounts...');

    const accounts = await db.linkedAccounts.getObjList();
    const linkedAccounts = accounts.filter((la) => la.status === 0);

    if (linkedAccounts.length === 0) {
      this.log('No linked accounts.');
      return;
    }
    await Promise.all(
      linkedAccounts.map(async (account) => {
        let provider;

        switch (account.provider) {
          case 'aniworld':
            provider = new AniworldProvider(this.getModule());
            break;
          case 'sto':
            provider = new StoProvider(this.getModule());
            break;
          default:
            return;
        }

        const token = (await client.getAccountToken(account))!;
        await provider.setToken(token);

        const linkStatus = await provider.testConnection();

        if (!linkStatus) {
          client.updatePreloadMsg(`Requesting re-link for ${account.provider}`);
          await provider.startLink();
        }
      }),
    );

    this.log('Done checking links');
  }

  stop(): Promise<undefined> {
    this.log('check-account-linking stopped');
    return Promise.resolve(undefined);
  }
}
