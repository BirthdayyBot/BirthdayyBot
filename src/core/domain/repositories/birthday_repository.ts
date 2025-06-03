import type { Birthday, BirthdayIdentifier } from '#domain/entities/birthday/birthday';
import type { BaseRepository } from '#domain/repositories/base_repository';

/**
 * Repository interface for managing Birthday entities
 */
export interface BirthdayRepository<T extends Birthday = Birthday> extends BaseRepository<T, BirthdayIdentifier> {
	/**
	 * Finds all entities for a specific user across all guilds
	 * @param userId - The Discord user ID
	 * @returns Array of entities for the user
	 */
	findByUser(userId: string): Promise<T[]>;

	/**
	 * Finds all entities for a specific guild
	 * @param guildId - The Discord guild ID
	 * @returns Array of entities for the guild
	 */
	findByGuild(guildId: string): Promise<T[]>;

	/**
	 * Finds a specific entity by user and guild
	 * @param userId - The Discord user ID
	 * @param guildId - The Discord guild ID
	 * @returns The entity for the user in the specified guild, or null if not found
	 */
	findByUserAndGuild(id: BirthdayIdentifier): Promise<T | null>;
}
