import type { Birthday } from '#root/core/domain/entites/birthday';

/**
 * Interface for entities that can have multiple birthdays associated with them
 * This is typically implemented by User and GuildConfig entities
 */
export interface WithBirthdays {
	/** Collection of birthday entries associated with this entity */
	birthday?: Birthday[];
}

/**
 * Utility type to extract the birthday collection from an entity
 */
export type BirthdayCollection<T extends WithBirthdays> = NonNullable<T['birthday']>;
