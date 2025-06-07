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
	 * @template DomainEntity - The entity type
	 */
	export type UpdateData<DomainEntity> = Partial<Omit<DomainEntity, 'id' | keyof TimestampedEntity>>;

	/**
	 * Utility type for creating new entities with optional timestamps
	 * @template DomainEntity - The entity type
	 */
	export type CreateData<DomainEntity> = Omit<DomainEntity, 'id' | 'disabled' | 'createdAt' | 'updatedAt'> &
		OptionalTimestampedEntity;

	export type CreateManyData<DomainEntity> = DomainEntity[];
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
	findOrCreate<SelectedFields extends readonly (keyof DomainEntity)[] = readonly (keyof DomainEntity)[]>(
		id: TId,
		data: Repository.CreateData<DomainEntity> | Repository.UpdateData<DomainEntity>,
		select?: SelectedFields
	): Promise<
		SelectedFields extends readonly (keyof DomainEntity)[]
			? Pick<DomainEntity, SelectedFields[number]>
			: DomainEntity
	>;

	/**
	 * Finds an entity by its identifier
	 * @param id - The entity identifier
	 * @param select - Optional fields to select from the entity
	 * @returns The found entity or null if not found
	 */
	findById<SelectedFields extends readonly (keyof DomainEntity)[] = readonly (keyof DomainEntity)[]>(
		id: TId,
		select?: SelectedFields
	): Promise<
		SelectedFields extends readonly (keyof DomainEntity)[]
			? Pick<DomainEntity, SelectedFields[number]>
			: DomainEntity | null
	>;

	/**
	 * Updates an existing entity
	 * @param id - The entity identifier
	 * @param data - The partial data to update
	 * @param select - Optional fields to select from the updated entity
	 * @returns The updated entity
	 */
	update<SelectedFields extends readonly (keyof DomainEntity)[] = readonly (keyof DomainEntity)[]>(
		id: TId,
		data: Repository.UpdateData<DomainEntity>,
		select?: SelectedFields
	): Promise<
		SelectedFields extends readonly (keyof DomainEntity)[]
			? Pick<DomainEntity, SelectedFields[number]>
			: DomainEntity | null
	>;

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
	findAll(options?: Repository.PaginationOptions): Promise<DomainEntity[]>;

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
}
