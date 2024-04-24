import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ emitter: 'ws', event: GatewayDispatchEvents.GuildCreate })
export class UserListener extends Listener {
	public run(data: GatewayGuildCreateDispatch['d'], shardId: number) {
		this.container.client.guildMemberFetchQueue.add(shardId, data.id);
	}
}
