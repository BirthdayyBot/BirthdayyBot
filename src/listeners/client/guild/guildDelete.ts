import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, type ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { DEBUG, leaveServerLog } from '../../../helpers';

@ApplyOptions<ListenerOptions>({ event: Events.GuildDelete })
export class UserEvent extends Listener<typeof Events.GuildDelete> {
	public async run(guild: Guild) {
		const guild_id = guild.id;

		if (!container.client.isReady()) return;

		this.container.logger.debug(`[EVENT] ${Events.GuildDelete} - ${guild.name} (${guild_id})`);
		DEBUG ? container.logger.debug(`[GuildDelete] - ${guild.toString()}`) : null;

		await leaveServerLog(guild);
		await container.utilities.guild.update.DisableGuildAndBirthdays(guild_id, true);
	}
}
