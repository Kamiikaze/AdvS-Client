import type {
  IBaseKernelModule,
  IKernel,
  InMemCache,
} from '@grandlinex/e-kernel';
import { BaseElement } from '@grandlinex/e-kernel';
import type MainDB from '../db/MainDB';
import type MainClient from '../client/MainClient';
import { AccountStatus } from '../db/entities/LinkedAccounts';

/**
 * BaseProvider class
 */
export default abstract class BaseProvider extends BaseElement<
  IKernel,
  MainDB,
  MainClient,
  InMemCache
> {
  protected db: MainDB;

  protected client: MainClient;

  protected providerName: string;

  protected constructor(
    providerName: string,
    mod: IBaseKernelModule<MainDB, MainClient, InMemCache>,
  ) {
    super(`provider:${providerName}`, mod);
    this.db = mod.getDb();
    this.client = mod.getClient();
    this.providerName = providerName;
  }

  /**
   * Start the link/connection with user interaction
   */
  abstract startLink(): Promise<void>;

  async saveToken(token: string): Promise<void> {
    const acc = await this.db.linkedAccounts.findObj({
      provider: this.providerName,
    });
    if (!acc) {
      this.error(`No linked account found for ${this.providerName}`);
      return;
    }
    await this.client.setAccountToken(acc, token);
    await this.db.linkedAccounts.updateObject(acc.e_id, {
      status: AccountStatus.SYNCED,
      updated: Date.now(),
    });
  }

  /**
   * Test the connection
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Retrieves the status of the linked account.
   */
  async getLinkStatus() {
    const linkedAccount = await this.db.linkedAccounts.findObj({
      provider: this.providerName,
    });

    if (!linkedAccount) {
      this.error(`No linked account found for ${this.providerName}`);
      return AccountStatus.ERROR;
    }

    return linkedAccount.status;
  }
}
