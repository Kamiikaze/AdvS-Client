import type { ICoreAnyModule, XActionEvent } from '@grandlinex/e-kernel';
import { BaseAction } from '@grandlinex/e-kernel';
import type { SetActivity } from '@xhayper/discord-rpc';
import type MainDB from '../db/MainDB';
import discordRPC from '../lib/discordRPC';

export default class SetDiscordRPC extends BaseAction<MainDB> {
  constructor(mod: ICoreAnyModule) {
    super('set-discord-rpc', mod);
    this.handler = this.handler.bind(this);
  }

  async handler({
    args,
  }: XActionEvent<{
    state: boolean;
    activity?: SetActivity;
  }>) {
    this.log(`action${this.channel}`, args);

    if (args.state) {
      this.log('Connecting DiscordRPC');
      if (!discordRPC.isConnected()) {
        await discordRPC.connect();
      }
    } else {
      this.log('Disconnecting DiscordRPC');
      await discordRPC.clearActivity();
      await discordRPC.disconnect();
      return true;
    }

    if (!args.activity) {
      this.log('Setting default ActivityStatus');

      return discordRPC.setActivity({
        details: 'Browsing AdvS Client',
        detailsUrl: 'https://github.com/Kamiikaze/AdvS-Client',
        state: '- by Kamikaze',
        stateUrl: 'https://github.com/Kamiikaze/AdvS-Client',
        largeImageKey: 'app-icon', // Must match asset name in Discord Developer Portal
        largeImageText: 'AdvS Client - by Kamikaze',
        largeImageUrl: 'https://github.com/Kamiikaze/AdvS-Client',
      });
    }

    this.log('Updating ActivityStatus', args.activity);
    return discordRPC.setActivity(args.activity);
  }
}
