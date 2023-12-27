import { getBirthdays } from '#utils/functions/guilds';
import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberRemove })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		const guildId = member.guild.id;
		const userId = member.user.id;

		const isRemoved = await getBirthdays(guildId).remove(userId);

		if (isRemoved) {
			container.logger.info(
				`[GuildMemberLeave] [GID: ${guildId}] [UID ${userId}] Removed birthday from left user`,
			);
		}
		container.logger.error(
			`[GuildMemberLeave] [GID: ${guildId}] [UID ${userId}] Could not remove birthday from left user: `,
		);
	}
}
