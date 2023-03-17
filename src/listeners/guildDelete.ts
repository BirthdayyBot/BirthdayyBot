import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import leaveServerLog from '../helpers/send/leaveServerLog';
import { leaveGuildRequest } from '../helpers/provide/guild';
import { DEBUG } from '../helpers/provide/environment';

@ApplyOptions<ListenerOptions>({})
export class UserEvent extends Listener {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.GuildDelete,
			enabled: true,
		});
	}
	public async run(guild: Guild) {
		const guild_id = guild.id;

		if (!container.client.isReady()) return;

		this.container.logger.debug(`[EVENT] ${Events.GuildDelete} - ${guild.name} (${guild_id})`);
		DEBUG ? container.logger.debug(`[GuildDelete] - ${guild}`) : null;

		await leaveServerLog(guild);
		await leaveGuildRequest(guild_id);
	}
}
