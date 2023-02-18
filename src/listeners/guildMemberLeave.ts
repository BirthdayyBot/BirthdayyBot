const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
import { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { AUTOCODE_ENV, BIRTHDAYY_ID, BOT_ID } from '../helpers/provide/environment';
import updateBirthdayOverview from '../helpers/update/overview';
import leaveServerLog from '../helpers/send/leaveServerLog';
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: Events.GuildMemberRemove,
			enabled: true
		});
	}
	public async run(member: GuildMember) {
		//TODO: remove from database and update birthday list
		//Code: https://autocode.com/mp/chillihero/birthday-bot/dev/?filename=functions%2Fevents%2Fdiscord%2Fguild%2Fmember%2Fremove.js
		console.log('member', member);

		const user_id = member.user.id;
		const guild_id = member.guild.id;

		if (user_id === BIRTHDAYY_ID) {
			//todo: add custom bot server check
			// if (customBotServer.includes(guild_id)) {
			// 	const serverHasCustomBot = 'Dont delete anything its a custom Bot server';
			// 	console.warn(serverHasCustomBot);
			// 	return serverHasCustomBot;
			// }
			await removeData(guild_id);

			//todo: add error log if removeGuildRequest fails
		} else if (user_id === BOT_ID) {
			// remove all Data if Bot got removed from a server
			await removeData(guild_id);
		} else {
			try {
				let removeUserRequest = await lib.chillihero['birthday-api']['@release'].birthday.delete({
					user_id: user_id,
					guild_id: guild_id
				});
				if (removeUserRequest.success) {
					await updateBirthdayOverview(guild_id);
				}
			} catch (e) {
				console.warn(`Couldn not remove birthday from left user`);
				console.warn(e);
			}
		}
		async function removeData(guild_id: string) {
			//left user is Bot and not a custom bot server
			await leaveServerLog(guild_id);
			//todo: add error log if removeConfig fails

			let removeGuildRequest = await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.remove({
				guild_id: guild_id
			});
		}
	}
}
