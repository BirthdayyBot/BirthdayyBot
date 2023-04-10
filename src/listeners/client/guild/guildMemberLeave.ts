import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import { DiscordAPIError, GuildMember } from 'discord.js';
import updateBirthdayOverview from '../../../helpers/update/overview';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberRemove })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		const userId = member.user.id;
		const guildId = member.guild.id;
		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guildId, userId);
		if (!birthday) return;
		try {
			const removeUserRequest = await container.utilities.birthday.delete.ByGuildAndUser(guildId, userId);
			if (removeUserRequest) {
				await updateBirthdayOverview(guildId);
			}
			await this.container.tasks.run('PostStats', {});
		} catch (error: any) {
			if (error instanceof DiscordAPIError) {
				container.logger.warn(
					`[GuildMemberLeave] [GID: ${guildId}] [UID ${userId}] Could not remove birthday from left user: `,
					error.message,
				);
			}
		}
	}
}
