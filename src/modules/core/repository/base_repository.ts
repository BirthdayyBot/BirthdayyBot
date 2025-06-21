import type { Entity } from '#core/domain/entity';
import type { Identifier } from '#core/domain/identifier';
import { cache } from '#core/services/cache';
import type { CacheProvider } from 'bentocache/types';

/**
 * Base repository class providing CRUD operations with caching capabilities.
 *
 * @template DomainEntity - Type of the domain entity managed by the repository
 * @template DataBaseEntity - Type of the entity's database representation
 * @template EntityIdentifier - Type of the entity identifier, must extend Identifier
 *
 * @example
 * ```typescript
 * class UserRepository extends BaseRepository<User, UserDB, UserId> {
 *   protected async createInSource(id: UserId, entity: UserDB): Promise<User> {
 *     // Implementation
 *   }
 *   // ... other implementations
 * }
 * ```
 */
export abstract class BaseRepository<
	EntityIdentifier extends Identifier<any>,
	DomainEntity extends Entity & { props: Record<string, any> },
	DataBaseEntity extends Record<string, any>
> {
	protected cacheStore?: 'memory' | 'multitier';
	private readonly name: string;
	private cache: CacheProvider | typeof cache;
	private readonly ttl: number = 60 * 60;

	/**
	 * Creates a new repository instance with caching capabilities.
	 *
	 * @param name - Unique identifier for the repository cache namespace
	 * @param cacheStore - Optional cache store type ('memory' or 'multitier')
	 */
	protected constructor(name: string, cacheStore?: 'memory' | 'multitier') {
		this.name = name;
		this.cacheStore = cacheStore;
		this.cache = cacheStore ? cache.use(cacheStore) : cache;
	}

	/**
	 * Creates an entity and stores it in both the data source and cache.
	 *
	 * @param key - Unique identifier for the entity
	 * @param entity - Entity data to create
	 * @returns Promise resolving to the created domain entity
	 * @throws Error if creation fails
	 */
	public async create(key: EntityIdentifier, entity: Omit<DomainEntity['props'], 'id'>): Promise<DomainEntity> {
		const created = await this.createInSource(key, entity);
		await this.cache.set({
			key: this.getCacheKey(key),
			value: created,
			ttl: this.ttl
		});
		return this.toDomain(created);
	}

	/**
	 * Retrieves an entity by its identifier, using cache when available.
	 *
	 * @param key - Unique identifier of the entity to find
	 * @returns Promise resolving to the domain entity if found, null otherwise
	 * @throws Error if retrieval fails
	 */
	public async find(key: EntityIdentifier): Promise<DomainEntity | null> {
		const record = await this.cache.getOrSet({
			key: this.getCacheKey(key),
			factory: () => this.findFromSource(key),
			ttl: this.ttl
		});
		return record ? this.toDomain(record) : null;
	}

	/**
	 * Updates an entity in both the data source and cache.
	 *
	 * @param key - Unique identifier of the entity to update
	 * @param entity - Updated entity data
	 * @returns Promise resolving to the updated domain entity
	 * @throws Error if update fails or entity doesn't exist
	 */
	public async update(
		key: EntityIdentifier,
		entity: Partial<Omit<DomainEntity['props'], 'id'>>
	): Promise<DomainEntity> {
		const updated = await this.updateInSource(key, entity);
		await this.cache.set({
			key: this.getCacheKey(key),
			value: updated,
			ttl: this.ttl
		});
		return this.toDomain(updated);
	}

	/**
	 * Deletes an entity from both the data source and cache.
	 *
	 * @param key - Unique identifier of the entity to delete
	 * @returns Promise resolving to the deleted domain entity if successful, null if not found
	 * @throws Error if deletion fails
	 */
	public async delete(key: EntityIdentifier): Promise<DomainEntity | null> {
		const deleted = await this.deleteFromSource(key);
		if (deleted) {
			await this.cache.delete({
				key: this.getCacheKey(key)
			});
			return this.toDomain(deleted);
		}
		return null;
	}

	/**
	 * Implementation for creating an entity in the data source.
	 * @param key - Entity identifier
	 * @param entity - Entity data to create
	 * @returns Promise resolving to the created domain entity
	 */
	protected abstract createInSource(
		key: EntityIdentifier,
		entity: Omit<DomainEntity['props'], 'id'>
	): Promise<DataBaseEntity>;

	/**
	 * Implementation for finding an entity in the data source.
	 * @param key - Entity identifier to find
	 * @returns Promise resolving to the domain entity if found, null otherwise
	 */
	protected abstract findFromSource(key: EntityIdentifier): Promise<DataBaseEntity | null>;

	/**
	 * Implementation for updating an entity in the data source.
	 * @param key - Entity identifier
	 * @param entity - Updated entity data
	 * @returns Promise resolving to the updated domain entity
	 */
	protected abstract updateInSource(
		key: EntityIdentifier,
		entity: Partial<Omit<DomainEntity['props'], 'id'>>
	): Promise<DataBaseEntity>;

	/**
	 * Implementation for deleting an entity from the data source.
	 * @param key - Entity identifier to delete
	 * @returns Promise resolving to the deleted domain entity if successful, null if not found
	 */
	protected abstract deleteFromSource(key: EntityIdentifier): Promise<DataBaseEntity | null>;

	/**
	 * Converts a domain entity to its database representation.
	 * @param entity - Domain entity to convert
	 * @returns Database entity representation
	 */
	public abstract toDomain(entity: DataBaseEntity): DomainEntity;

	private getCacheKey(key: EntityIdentifier): string {
		return `${this.name}:${key.toString()}`;
	}
}
