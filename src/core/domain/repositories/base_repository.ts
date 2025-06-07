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
	export type CreateData<T> = Omit<T, 'id' | 'disabled' | 'createdAt' | 'updatedAt'> & OptionalTimestampedEntity;

	export type CreateManyData<T> = T[];
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
	 * @param select - Optional fields to select from the entity
	 * @returns The found or created user
	 */
	findOrCreate<SelectedFields extends readonly (keyof T)[] = readonly (keyof T)[]>(
		id: TId,
		data: Repository.CreateData<T> | Repository.UpdateData<T>,
		select?: SelectedFields
	): Promise<SelectedFields extends readonly (keyof T)[] ? Pick<T, SelectedFields[number]> : T>;

	/**
	 * Finds an entity by its identifier
	 * @param id - The entity identifier
	 * @param select - Optional fields to select from the entity
	 * @returns The found entity or null if not found
	 */
	findById<SelectedFields extends readonly (keyof T)[] = readonly (keyof T)[]>(
		id: TId,
		select?: SelectedFields
	): Promise<SelectedFields extends readonly (keyof T)[] ? Pick<T, SelectedFields[number]> : T | null>;

	/**
	 * Updates an existing entity
	 * @param id - The entity identifier
	 * @param data - The partial data to update
	 * @param select - Optional fields to select from the updated entity
	 * @returns The updated entity
	 */
	update<SelectedFields extends readonly (keyof T)[] = readonly (keyof T)[]>(
		id: TId,
		data: Repository.UpdateData<T>,
		select?: SelectedFields
	): Promise<SelectedFields extends readonly (keyof T)[] ? Pick<T, SelectedFields[number]> : T | null>;

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
	createMany(entities: Repository.CreateManyData<T>): Promise<T[]>;
}
