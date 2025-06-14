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
	 * Utility type for create operations that includes all fields except identifiers and timestamp fields
	 * @template DomainEntity - The entity type
	 */
	export type CreateData<DomainEntity> = Omit<DomainEntity, 'id' | keyof TimestampedEntity> &
		OptionalTimestampedEntity;

	/**
	 * Utility type for create operations that includes all fields except identifiers and timestamp fields
	 * @template DomainEntity - The entity type
	 */
	export type CreateManyData<DomainEntity> = DomainEntity[];

	/**
	 * Utility type for update operations that includes all fields except identifiers and timestamp fields
	 * @template DomainEntity - The entity type
	 */
	export type UpdateData<DomainEntity> = Partial<Omit<DomainEntity, 'id' | keyof TimestampedEntity>>;
}

/**
 * Base repository interface with common operations for all repositories
 * @template DomainEntity - The entity type
 */
export interface BaseRepository<DomainEntity extends TimestampedEntity, TId = string> {
	/**
	 * Finds or creates an entity
	 * @param id - The entity identifier
	 * @param data - Default data to use if user needs to be created
	 * @param select - Optional fields to select from the entity
	 * @returns The found or created user
	 */
	findOrCreate(
		id: TId,
		data: Repository.CreateData<DomainEntity> | Repository.UpdateData<DomainEntity>
	): Promise<DomainEntity>;

	/**
	 * Finds an entity by its identifier
	 * @param id - The entity identifier
	 * @param select - Optional fields to select from the entity
	 * @returns The found entity or null if not found
	 */
	findById(id: TId): Promise<DomainEntity | null>;

	/**
	 * Retrieves all entities of this type
	 * @param options - Optional pagination parameters
	 * @returns Array of entities
	 */
	findAll(options?: Repository.PaginationOptions): Promise<DomainEntity[]>;

	/**
	 * Updates an existing entity
	 * @param id - The entity identifier
	 * @param data - The partial data to update
	 * @param select - Optional fields to select from the updated entity
	 * @returns The updated entity
	 */
	update(id: TId, data: Repository.UpdateData<DomainEntity>): Promise<DomainEntity | null>;

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
	createMany(entities: Repository.CreateManyData<DomainEntity>): Promise<DomainEntity[]>;

	/**
	 * Deletes an entity by its identifier
	 * @param id - The entity identifier
	 * @returns void
	 */
	deleteById(id: TId): Promise<void>;
}
