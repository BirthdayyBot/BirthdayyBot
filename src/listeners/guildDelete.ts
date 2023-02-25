import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import leaveServerLog from '../helpers/send/leaveServerLog';
import { AUTOCODE_ENV } from '../helpers/provide/environment';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: true,
			event: Events.GuildDelete,
			enabled: true
		});
	}
	public async run(guild: Guild) {
		const guild_id = guild.id;
		console.log(`[EVENT] ${Events.GuildDelete} - ${guild.name} (${guild_id})`);
		await removeData(guild_id);

		async function removeData(guild_id: string) {
			await leaveServerLog(guild_id);
			//todo: add error log if removeConfig fails
			return await lib.chillihero['birthday-api'][AUTOCODE_ENV].guild.remove({
				guild_id: guild_id
			});
		}
	}
}
