import { container } from '@sapphire/framework';
import type { Guild } from 'discord.js';

export async function getGuildInformation(guild_id: string): Promise<Guild | null> {
	try {
		let guild: Guild | undefined;

		guild = container.client.guilds.cache.get(guild_id);
		if (!guild) {
			guild = await container.client.guilds.fetch(guild_id);
		}

		return guild;
	} catch (error) {
		console.error(`Error fetching guild with id ${guild_id}: ${error}`);
		return null;
	}
}
