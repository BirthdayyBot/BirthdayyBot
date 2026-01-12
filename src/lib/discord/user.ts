import { container } from '@sapphire/framework';
import { DiscordAPIError, User, type Snowflake } from 'discord.js';

export async function getUserInfo(userId: Snowflake): Promise<User | null> {
	try {
		const user = await container.client.users.fetch(userId);
		return user;
	} catch (error) {
		if (error instanceof DiscordAPIError) {
			container.logger.warn(`[getUserInfo] Failed to fetch user ${userId}: ${error.message}`);
		}
		return null;
	}
}
