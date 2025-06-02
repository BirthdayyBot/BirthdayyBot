import type { TimestampedEntity } from '#root/core/domain/entites/timestamped_entity';
import type { BirthdayIdentifier } from '#root/core/domain/entites/identifiable';

/**
 * Birthday entity representing a user's birthday in a specific guild
 */
export interface Birthday extends TimestampedEntity, BirthdayIdentifier {
	/** Birthday date in ISO format (YYYY-MM-DD) */
	birthday: string;
	/** Flag indicating if birthday notifications are disabled */
	disabled: boolean;
}

/**
 * Type for updating birthday data
 * Excludes identifiers and timestamp fields which should not be directly modified
 */
export type BirthdayUpdateData = Partial<Omit<Birthday, 'userId' | 'guildId' | keyof TimestampedEntity>>;

/**
 * Type for creating a new birthday
 * Makes timestamps optional as they're typically set by the database
 */
export type CreateBirthdayData = Omit<Birthday, keyof TimestampedEntity> & Partial<TimestampedEntity>;
