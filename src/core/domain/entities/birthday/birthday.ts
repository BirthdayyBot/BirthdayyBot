import type { TimestampedEntity } from '#domain/entities/base/timestamped_entity';

/**
 * Birthday entity representing a user's birthday in a specific guild
 */
export interface Birthday extends TimestampedEntity, BirthdayIdentifier {
	/** Birthday date in ISO format (YYYY-MM-DD), strictly a date-only format without time */
	birthday: string;
	/** Flag indicating if birthday notifications are disabled */
	disabled: boolean;
}

/**
 * Interface for entities that are identified by a combination of user ID and guild ID
 */
export interface BirthdayIdentifier {
	/** The user ID associated with this birthday entity */
	userId: string;
	/** The guild ID associated with this entity */
	guildId: string;
}
