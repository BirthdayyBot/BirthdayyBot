import { container } from '@sapphire/framework';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import type { Guild, GuildMember } from 'discord.js';

export async function getGuildInformation(guild_id: string): Promise<Guild | null> {
	try {
		const guild: Guild | undefined = await container.client.guilds.fetch(guild_id);
		return guild;
	} catch (error) {
		container.logger.error(`Error fetching guild with id ${guild_id}: ${error}`);
		return null;
	}
}

export async function getGuildMember(guild_id: string, user_id: string): Promise<GuildMember | null> {
	try {
		const guild = await getGuildInformation(guild_id);
		if (isNullOrUndefinedOrEmpty(guild)) return null;
		const guild_member = await guild.members.fetch(user_id);
		return guild_member;
	} catch (error) {
		container.logger.error(`Error fetching guild member with id ${user_id}: ${error}`);
		return null;
	}
}
