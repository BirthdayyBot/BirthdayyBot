import type { WithBirthdays } from '#domain/entities/birthday/with_birthdays';
import type { Entity } from '#domain/entities/base/entity';

/**
 * User entity representing a Discord user within the application
 */
export interface User extends Entity, WithBirthdays {
	/** Discord username */
	username?: string;
	/** Discord discriminator (tag number) */
	discriminator?: string;
	/** Indicates whether the user has premium status */
	premium: boolean;
}
