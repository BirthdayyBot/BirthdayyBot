/**
 * Interface for entities that have a unique identifier
 * @template T The type of the identifier, defaults to string
 */
export interface Identifiable<T = string> {
	/** The unique identifier for this entity */
	id: T;
}

export interface BirthdayIdentifier {
	/** The user ID associated with this entity */
	userId: string;
	/** The guild ID associated with this entity, if applicable */
	guildId?: string;
}
