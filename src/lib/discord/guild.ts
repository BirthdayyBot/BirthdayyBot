import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { DiscordAPIError, Guild, GuildMember, Role, type Snowflake } from 'discord.js';

export async function getGuildInformation(guildId: Snowflake): Promise<Guild | null> {
	return container.client.guilds.fetch(guildId).catch((error) => {
		if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownGuild) return null;
		container.logger.error(`Error fetching guild with id ${guildId}:`, error);
		return null;
	});
}

export async function getGuildMember(guildId: Snowflake, userId: Snowflake): Promise<GuildMember | null> {
	const guild = await getGuildInformation(guildId);
	if (isNullOrUndefinedOrEmpty(guild) || isNullOrUndefinedOrEmpty(userId)) return null;
	return guild.members.fetch(userId).catch((error) => {
		if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) return null;
		container.logger.error(`Error fetching guild member with id ${userId}:`, error);
		return null;
	});
}

export async function getGuildRole(guildId: Snowflake, roleId: Snowflake): Promise<Role | null> {
	const guild = await getGuildInformation(guildId);
	if (isNullOrUndefinedOrEmpty(guild)) return null;
	return guild.roles.fetch(roleId).catch((error) => {
		if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownRole) return null;
		container.logger.error(`Error fetching guild role with id ${roleId}:`, error);
		return null;
	});
}
