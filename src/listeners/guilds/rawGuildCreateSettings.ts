import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public async run({ id: guildId }: GatewayGuildCreateDispatch['d'], _shardId: number) {
		return this.container.prisma.guild.upsert({
			update: { disabled: false },
			create: { guildId },
			where: { guildId }
		});
	}
}
