import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildDeleteDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildDelete, emitter: 'ws' })
export class UserListener extends Listener {
	public run(data: GatewayGuildDeleteDispatch['d'], _shardId: number) {
		if (data.unavailable) return;

		return this.container.prisma.guild.upsert({
			create: { guildId: data.id, disabled: true },
			update: { disabled: true },
			where: { guildId: data.id }
		});
	}
}
