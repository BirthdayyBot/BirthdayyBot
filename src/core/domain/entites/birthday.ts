import type { TimestampedEntity } from '#root/core/domain/entites/timestamped_entity';
import type { UserGuildIdentifiable } from '#root/core/domain/entites/user_guild_identifiable';
import type { Repository } from '#root/core/domain/repositories/base_repository';

/**
 * Birthday entity representing a user's birthday in a specific guild
 */
export interface Birthday extends TimestampedEntity, UserGuildIdentifiable {
	/** Birthday date in ISO format (YYYY-MM-DD) */
	birthday: string;
	/** Flag indicating if birthday notifications are disabled */
	disabled: boolean;
}

/**
 * Type for updating birthday data
 * Excludes identifiers and timestamp fields which should not be directly modified
 */
export type BirthdayUpdateData = Repository.UpdateData<Birthday>;

/**
 * Type for creating a new birthday
 * Makes timestamps optional as they're typically set by the database
 */
export type CreateBirthdayData = Repository.CreateData<Birthday>;
