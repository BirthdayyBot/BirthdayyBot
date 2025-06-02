/**
 * Interface for entities that are identified by a combination of user ID and guild ID
 */
export interface UserGuildIdentifiable {
	/** The user ID associated with this entity */
	userId: string;
	/** The guild ID associated with this entity */
	guildId: string;
}

/**
 * Type for compound identifiers used with UserGuildIdentifiable entities
 */
export interface UserGuildIdentifier {
	userId: string;
	guildId: string;
}
