import { container } from '@sapphire/framework';
import { DiscordAPIError, User, type Snowflake } from 'discord.js';

export async function getUserInfo(userId: Snowflake): Promise<User | null> {
	try {
		const user = await container.client.users.fetch(userId);
		return user;
	} catch (error) {
		if (error instanceof DiscordAPIError) {
			container.logger.error(`Error fetching user with id ${userId}: ${error.name}`);
		}
		return null;
	}
}
