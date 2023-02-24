import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
// const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

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
	}
}
