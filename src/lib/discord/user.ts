import { container } from '@sapphire/framework';
import type { Snowflake, User } from 'discord.js';

export async function getUserInfo(userId: Snowflake): Promise<User | null> {
	try {
		const user = await container.client.users.fetch(userId);
		return user;
	} catch (error) {
		container.logger.error(`Error fetching user with id ${userId}: ${error}`);
		return null;
	}
}
