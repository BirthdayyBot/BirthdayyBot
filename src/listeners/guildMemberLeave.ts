import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { AUTOCODE_ENV } from '../helpers/provide/environment';
import updateBirthdayOverview from '../helpers/update/overview';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

@ApplyOptions<Listener.Options>({ event: Events.GuildMemberRemove })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		const user_id = member.user.id;
		const guild_id = member.guild.id;

		try {
			const removeUserRequest = await lib.chillihero['birthday-api'][AUTOCODE_ENV].birthday.delete({
				user_id: user_id,
				guild_id: guild_id,
			});
			if (removeUserRequest.success) {
				await updateBirthdayOverview(guild_id);
			}
		} catch (e) {
			container.logger.warn('Couldn not remove birthday from left user');
			container.logger.warn(e);
		}
	}
}
