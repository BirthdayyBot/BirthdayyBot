import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GatewayDispatchEvents, type GatewayGuildMemberRemoveDispatch } from 'discord.js';

@ApplyOptions<Listener.Options>({ emitter: 'ws', event: GatewayDispatchEvents.GuildMemberRemove })
export class UserListener extends Listener {
	public run(data: GatewayGuildMemberRemoveDispatch['d']) {
		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.available) return;

		const member = guild.members.cache.get(data.user.id) ?? null;

		if (isNullish(member)) return;

		void this.container.prisma.birthday.delete({
			where: { userId_guildId: { guildId: guild.id, userId: member.id } }
		});
	}
}
