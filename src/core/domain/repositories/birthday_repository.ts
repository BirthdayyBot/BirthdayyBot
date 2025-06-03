import type { Birthday, BirthdayUpdateData } from '#domain/entities/birthday';
import type { UserGuildIdentifier } from '#domain/entities/user_guild_identifiable';
import type { CompositeIdRepository } from '#domain/repositories/base_repository';

/**
 * Repository interface for managing Birthday entities
 */
export interface BirthdayRepository extends CompositeIdRepository<Birthday> {
	/**
	 * Finds all birthdays for a specific guild
	 * @param guildId - The Discord guild ID
	 * @param includeDisabled - Whether to include disabled birthdays (default: false)
	 * @returns Array of birthdays
	 */
	findByGuild(guildId: string, includeDisabled?: boolean): Promise<Birthday[]>;

	/**
	 * Finds all birthdays for a specific user across all guilds
	 * @param userId - The Discord user ID
	 * @param includeDisabled - Whether to include disabled birthdays (default: false)
	 * @returns Array of birthdays
	 */
	findByUser(userId: string, includeDisabled?: boolean): Promise<Birthday[]>;

	/**
	 * Finds birthdays for a specific date
	 * @param month - Month (1-12)
	 * @param day - Day (1-31)
	 * @returns Array of birthdays matching the date
	 */
	findByDate(month: number, day: number): Promise<Birthday[]>;

	/**
	 * Enables a previously disabled birthday
	 * @param identifier - The birthday identifier
	 * @returns The updated birthday or null if not found
	 */
	enable(identifier: UserGuildIdentifier): Promise<Birthday | null>;

	/**
	 * Disables a birthday without deleting it
	 * @param identifier - The birthday identifier
	 * @returns The updated birthday or null if not found
	 */
	disable(identifier: UserGuildIdentifier): Promise<Birthday | null>;

	/**
	 * Updates a birthday entry
	 * @param identifier - The birthday identifier
	 * @param data - The data to update
	 * @returns The updated birthday
	 */
	update(identifier: UserGuildIdentifier, data: BirthdayUpdateData): Promise<Birthday>;

	/**
	 * Counts birthdays in a guild
	 * @param guildId - The Discord guild ID
	 * @param activeOnly - Whether to count only active birthdays (default: true)
	 * @returns The count of birthdays
	 */
	countByGuild(guildId: string, activeOnly?: boolean): Promise<number>;
}
