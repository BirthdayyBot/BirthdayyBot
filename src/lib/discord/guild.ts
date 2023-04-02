import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import type { Guild, GuildMember, Role, Snowflake } from 'discord.js';

export async function getGuildInformation(guildId: string): Promise<Guild | null> {
	try {
		return container.client.guilds.fetch(guildId);
	} catch (error) {
		container.logger.error(`Error fetching guild with id ${guildId}:`, error);
		return null;
	}
}

export async function getGuildMember(guildId: string, userId: string): Promise<GuildMember | null> {
	try {
		const guild = await getGuildInformation(guildId);
		if (isNullOrUndefinedOrEmpty(guild)) return null;
		return await guild.members.fetch(userId);
	} catch (error) {
		container.logger.error(`Error fetching guild member with id ${userId}:`, error);
		return null;
	}
}

export async function getGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<Role | null> {
	try {
		const guild = await getGuildInformation(guildId);
		if (isNullOrUndefinedOrEmpty(guild)) return null;
		return guild.roles.fetch(roleId);
	} catch (error) {
		container.logger.error(`Error fetching guild role with id ${roleId}:`, error);
		return null;
	}
}
