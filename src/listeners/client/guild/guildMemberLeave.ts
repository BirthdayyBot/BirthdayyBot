import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import updateBirthdayOverview from '../../../helpers/update/overview';

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberRemove })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		const userId = member.user.id;
		const guildId = member.guild.id;

		try {
			const removeUserRequest = await container.utilities.birthday.delete.ByGuildAndUser(guildId, userId);
			if (removeUserRequest) {
				await updateBirthdayOverview(guildId);
			}
		} catch (e) {
			container.logger.warn('Couldn not remove birthday from left user');
			container.logger.warn(e);
		}
	}
}
