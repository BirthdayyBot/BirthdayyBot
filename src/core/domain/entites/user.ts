import type { Identifiable } from '#root/core/domain/entites/identifiable';
import type { TimestampedEntity } from '#root/core/domain/entites/timestamped_entity.js';
import type { WithBirthdays } from '#root/core/domain/entites/with_birthdays';

/**
 * User entity representing a Discord user within the application
 */
export interface User extends TimestampedEntity, WithBirthdays, Identifiable {
	/** Discord username */
	username?: string;
	/** Discord discriminator (tag number) */
	discriminator?: string;
	/** Indicates whether the user has premium status */
	premium: boolean;
}

/**
 * Type for creating a new user
 * Makes timestamps and related collections optional
 */
export type CreateUserData = Omit<User, keyof TimestampedEntity | keyof WithBirthdays> &
	Partial<TimestampedEntity> &
	Partial<WithBirthdays>;

/**
 * Type for updating user data
 * Excludes identifier and timestamp fields
 */
export type UserUpdateData = Partial<Omit<User, 'id' | keyof TimestampedEntity>>;
