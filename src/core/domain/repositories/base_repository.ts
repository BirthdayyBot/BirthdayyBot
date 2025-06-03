import type { OptionalTimestampedEntity, TimestampedEntity } from '#domain/entities/base/timestamped_entity';

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
	export type UpdateData<T> = Partial<Omit<T, 'id' | keyof TimestampedEntity>>;

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
export interface BaseRepository<T extends TimestampedEntity, TId = string> {
	/**
	 * Finds or creates an entity
	 * @param id - The entity identifier
	 * @param data - Default data to use if user needs to be created
	 * @returns The found or created user
	 */
	findOrCreate(id: TId, data: Repository.CreateData<T> | Repository.UpdateData<T>): Promise<T>;

	/**
	 * Finds an entity by its identifier
	 * @param id - The entity identifier
	 * @returns The found entity or null if not found
	 */
	findById(id: TId): Promise<T | null>;

	/**
	 * Updates an existing entity
	 * @param id - The entity identifier
	 * @param data - The partial data to update
	 * @returns The updated entity
	 */
	update(id: TId, data: Repository.UpdateData<T>): Promise<T | null>;

	/**
	 * Deletes an entity by its identifier
	 * @param id - The entity identifier
	 * @returns void
	 */
	deleteById(id: TId): Promise<void>;

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
	 * Finds an entity by its identifier
	 * @param entities - The entity identifier or identifiers
	 * @returns The found entity or null if not found
	 */
	createMany(entities: Repository.CreateData<T>[]): Promise<T[]>;
}
