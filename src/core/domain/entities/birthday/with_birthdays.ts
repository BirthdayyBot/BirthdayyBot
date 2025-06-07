import type { Birthday } from '#domain/entities/birthday/birthday';

/**
 * Represents an entity that can have multiple associated birthdays.
 * Typically implemented by User and GuildConfig entities.
 */
export interface WithBirthdays {
	/** Birthdays associated with this entity */
	birthdays?: Birthday[];
}

/**
 * Extracts the non-nullable birthday collection from an entity.
 */
export type BirthdayCollection<T extends WithBirthdays> = NonNullable<T['birthdays']>;
