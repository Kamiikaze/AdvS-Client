import { Client, type SetActivity } from '@xhayper/discord-rpc';

const CLIENT_ID = '1447518781361492143'; // Replace with your Discord Application ID

class DiscordRPCService {
  private client: Client | null = null;

  private connected = false;

  async connect(): Promise<boolean> {
    if (this.connected) return true;

    try {
      this.client = new Client({ clientId: CLIENT_ID });

      this.client.on('ready', () => {
        console.log('Discord RPC connected');
        this.connected = true;
      });

      await this.client.login();
      return true;
    } catch (error) {
      console.error('Failed to connect to Discord RPC:', error);
      this.connected = false;
      return false;
    }
  }

  async setActivity(activity: SetActivity): Promise<boolean> {
    if (!this.connected || !this.client?.user) {
      console.warn('Discord RPC not connected, attempting to connect...');
      const success = await this.connect();
      if (!success) return false;
    }

    try {
      await this.client!.user!.setActivity(activity);
      return true;
    } catch (error) {
      console.error('Failed to set Discord activity:', error);
      return false;
    }
  }

  async clearActivity(): Promise<boolean> {
    if (!this.connected || !this.client?.user) return false;

    try {
      await this.client.user.clearActivity();
      return true;
    } catch (error) {
      console.error('Failed to clear Discord activity:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected || !this.client) return;

    try {
      await this.client.destroy();
      this.connected = false;
      this.client = null;
      console.log('Discord RPC disconnected');
    } catch (error) {
      console.error('Failed to disconnect Discord RPC:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default new DiscordRPCService();
