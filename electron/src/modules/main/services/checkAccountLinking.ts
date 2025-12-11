import type { ICoreAnyModule, IKernel } from '@grandlinex/e-kernel';
import { CoreTriggerService } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';
import { createProvider, type ProviderKey } from '../static/providerList';
import { AccountStatus } from '../db/entities/LinkedAccounts';

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

    const accounts = await db.linkedAccounts.getObjList();
    const linkedAccounts = accounts.filter((la) => la.status === 0);

    if (linkedAccounts.length === 0) {
      this.log('No accounts linked');
      return;
    }

    client.updatePreloadMsg('Checking linked Accounts...');

    await Promise.all(
      linkedAccounts.map(async (account) => {
        const provider = createProvider(
          account.provider as ProviderKey,
          this.getModule()
        );
        await provider.init();

        this.log(`Testing connection for ${account.provider}`);
        const linkStatus = await provider.testConnection();

        if (!linkStatus) {
          client.updatePreloadMsg(`Requesting re-link for ${account.provider}`);
          try {
            await provider.startLink();
          } catch (err) {
            this.error('Link failed', err);
            client.updatePreloadMsg(
              `Failed to sync account ${account.provider}`
            );
            await db.linkedAccounts.updateObject(account.e_id, {
              status: AccountStatus.ERROR,
            });
          }
        } else {
          client.updatePreloadMsg(`Account ${account.provider} is synced`);
        }

        this.log(`Finished check for ${account.provider} linking`);
        client.updatePreloadMsg(
          `Finished check for ${account.provider} linking`
        );
      })
    );

    client.updatePreloadMsg('Complete');
    this.log('Done');
  }

  stop(): Promise<undefined> {
    this.log('check-account-linking stopped');
    return Promise.resolve(undefined);
  }
}
