import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import type { Guild, GuildMember, Role, Snowflake } from 'discord.js';

export async function getGuildInformation(guildId: string): Promise<Guild | null> {
	try {
		const guild: Guild = await container.client.guilds.fetch(guildId);
		return guild;
	} catch (error) {
		container.logger.error(`Error fetching guild with id ${guildId}: ${error}`);
		return null;
	}
}

export async function getGuildMember(guildId: string, userId: string): Promise<GuildMember | null> {
	try {
		const guild = await getGuildInformation(guildId);
		if (isNullOrUndefinedOrEmpty(guild)) return null;
		const guild_member = await guild.members.fetch(userId);
		return guild_member;
	} catch (error) {
		container.logger.error(`Error fetching guild member with id ${userId}: ${error}`);
		return null;
	}
}

export async function getGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<Role | null> {
	try {
		const guild = await getGuildInformation(guildId);
		if (isNullOrUndefinedOrEmpty(guild)) return null;
		const role = await guild.roles.fetch(roleId);
		return role;
	} catch (error) {
		container.logger.error(`Error fetching guild role with id ${roleId}: ${error}`);
		return null;
	}
}
