import type { Identifiable } from '#domain/entities/identifiable';
import type { OptionalTimestampedEntity, TimestampedEntity } from '#domain/entities/timestamped_entity';
import type { UserGuildIdentifiable, UserGuildIdentifier } from '#domain/entities/user_guild_identifiable';

/**
 * Common repository utilities and types
 */
export namespace Repository {
	/**
	 * Utility type for pagination parameters
	 */
	export interface PaginationOptions {
		limit?: number;
		offset?: number;
	}

	/**
	 * Utility type for update operations that excludes identifiers and timestamp fields
	 * @template T - The entity type
	 */
	export type UpdateData<T> = Partial<Omit<T, 'id' | 'userId' | 'guildId' | keyof TimestampedEntity>>;

	/**
	 * Utility type for creating new entities with optional timestamps
	 * @template T - The entity type
	 */
	export type CreateData<T> = Omit<T, keyof TimestampedEntity> & OptionalTimestampedEntity;
}

/**
 * Base repository interface with common operations for all repositories
 * @template T - The entity type
 */
export interface BaseRepository<T extends TimestampedEntity> {
	/**
	 * Retrieves all entities of this type
	 * @param options - Optional pagination parameters
	 * @returns Array of entities
	 */
	findAll(options?: Repository.PaginationOptions): Promise<T[]>;

	/**
	 * Counts all entities of this type
	 * @returns The total count
	 */
	count(): Promise<number>;

	/**
	 * Creates multiple entities in a single operation
	 * @param dataArray - Array of entity data to create
	 * @returns Array of created entities
	 */
	createBulk(dataArray: Repository.CreateData<T>[]): Promise<T[]>;
}

/**
 * Repository interface for entities with a single identifier (e.g., User, GuildConfig)
 * @template T - The entity type, must include timestamp fields and a single identifier
 * @template TId - The identifier type, defaults to string
 */
export interface SingleIdRepository<T extends TimestampedEntity & Identifiable, TId = string>
	extends BaseRepository<T> {
	/**
	 * Retrieves an entity by its identifier
	 * @param id - The entity identifier
	 * @returns The entity if found, null otherwise
	 */
	findById(id: TId): Promise<T | null>;

	/**
	 * Creates a new entity
	 * @param data - The entity data to create
	 * @returns The created entity with assigned ID and timestamps
	 */
	create(data: Repository.CreateData<T>): Promise<T>;

	/**
	 * Updates an existing entity
	 * @param id - The entity identifier
	 * @param data - The partial data to update
	 * @returns The updated entity
	 */
	update(id: TId, data: Repository.UpdateData<T>): Promise<T>;

	/**
	 * Deletes an entity by its identifier
	 * @param id - The entity identifier
	 * @returns void
	 */
	deleteById(id: TId): Promise<void>;

	/**
	 * Checks if an entity exists by its identifier
	 * @param id - The entity identifier
	 * @returns True if the entity exists, false otherwise
	 */
	exists(id: TId): Promise<boolean>;
}

/**
 * Repository interface for entities with composite user-guild identifiers (e.g., Birthday)
 * @template T - The entity type, must include timestamp fields and user/guild identifiers
 */
export interface CompositeIdRepository<T extends TimestampedEntity & UserGuildIdentifiable> extends BaseRepository<T> {
	/**
	 * Retrieves an entity by its composite identifier
	 * @param id - The composite identifier containing userId and guildId
	 * @returns The entity if found, null otherwise
	 */
	findById(id: UserGuildIdentifier): Promise<T | null>;

	/**
	 * Creates a new entity
	 * @param data - The entity data to create
	 * @returns The created entity with assigned timestamps
	 */
	create(data: Repository.CreateData<T>): Promise<T>;

	/**
	 * Updates an existing entity
	 * @param id - The composite identifier containing userId and guildId
	 * @param data - The partial data to update
	 * @returns The updated entity
	 */
	update(id: UserGuildIdentifier, data: Repository.UpdateData<T>): Promise<T>;

	/**
	 * Deletes an entity by its composite identifier
	 * @param id - The composite identifier containing userId and guildId
	 * @returns void
	 */
	deleteById(id: UserGuildIdentifier): Promise<void>;

	/**
	 * Checks if an entity exists by its composite identifier
	 * @param id - The composite identifier containing userId and guildId
	 * @returns True if the entity exists, false otherwise
	 */
	exists(id: UserGuildIdentifier): Promise<boolean>;

	/**
	 * Finds all entities for a specific guild
	 * @param guildId - The Discord guild ID
	 * @returns Array of entities
	 */
	findByGuild(guildId: string): Promise<T[]>;

	/**
	 * Finds all entities for a specific user
	 * @param userId - The Discord user ID
	 * @returns Array of entities
	 */
	findByUser(userId: string): Promise<T[]>;

	/**
	 * Deletes all entities for a specific guild
	 * @param guildId - The Discord guild ID
	 * @returns void
	 */
	deleteByGuild(guildId: string): Promise<void>;

	/**
	 * Deletes all entities for a specific user
	 * @param userId - The Discord user ID
	 * @returns void
	 */
	deleteByUser(userId: string): Promise<void>;
}
