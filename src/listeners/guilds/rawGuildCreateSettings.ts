import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#root/config';
import { GatewayDispatchEvents, type GatewayGuildCreateDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildCreate, emitter: 'ws' })
export class UserListener extends Listener {
	public async run({ id }: GatewayGuildCreateDispatch['d'], _shardId: number) {
		return this.container.prisma.guild.upsert({
			update: { disabled: false },
			create: { id, announcementMessage: DEFAULT_ANNOUNCEMENT_MESSAGE },
			where: { id }
		});
	}
}
