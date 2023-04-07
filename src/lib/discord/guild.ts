import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import type { Guild, GuildMember, Role, Snowflake } from 'discord.js';

export async function getGuildInformation(guildId: string): Promise<Guild | null> {
	try {
		return container.client.guilds.fetch(guildId);
	} catch (error) {
		if (error instanceof Error) {
			container.logger.error(`Error fetching guild with id ${guildId}:`, error.message);
		}
		return null;
	}
}

export async function getGuildMember(guildId: string, userId: string): Promise<GuildMember | null> {
	try {
		const guild = await getGuildInformation(guildId);
		if (isNullOrUndefinedOrEmpty(guild)) return null;
		return await guild.members.fetch(userId);
	} catch (error) {
		if (error instanceof Error) {
			container.logger.error(`Error fetching guild member with id ${userId}:`, error.message);
		}
		return null;
	}
}

export async function getGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<Role | null> {
	try {
		const guild = await getGuildInformation(guildId);
		if (isNullOrUndefinedOrEmpty(guild)) return null;
		return guild.roles.fetch(roleId);
	} catch (error) {
		if (error instanceof Error) {
			container.logger.error(`Error fetching guild role with id ${roleId}:`, error);
		}
		return null;
	}
}
