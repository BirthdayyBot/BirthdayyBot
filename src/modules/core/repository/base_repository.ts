import type { Entity } from '#core/domain/entity';
import type { Identifier } from '#core/domain/identifier';
import { cache } from '#core/services/cache';
import type { CacheProvider } from 'bentocache/types';

/**
 * Base repository class providing CRUD operations with caching capabilities.
 *
 * @template EntityIdentifier - Type of the entity identifier, must extend Identifier
 * @template DomainEntity - Type of the domain entity managed by the repository
 * @template DataBaseEntity - Type of the entity's database representation
 */
export abstract class BaseRepository<
	EntityIdentifier extends Identifier<string>,
	DomainEntity extends Entity<string, { id: EntityIdentifier }>,
	DataBaseEntity extends Record<string, unknown>
> {
	protected readonly cacheStore?: 'memory' | 'multitier';
	protected readonly cache: CacheProvider | typeof cache;
	protected readonly name: string;
	protected readonly ttl: number = 60 * 60;

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
	 * Saves an entity to the database and cache.
	 * @param entity - The domain entity to save
	 */
	public save(entity: DomainEntity): Promise<DomainEntity> {
		const key = entity.id;
		try {
			return this.cache.getOrSet({
				key: this.getCacheKey(key),
				ttl: this.ttl,
				factory: async () => {
					const data = await this.saveToDatabase(entity);
					return this.toDomain(data);
				}
			});
		} catch (error) {
			// Optionally log error
			throw new Error(`Failed to save entity: ${error}`);
		}
	}

	/**
	 * Removes an entity from the database and cache.
	 * @param identifier - The entity identifier
	 */
	public async remove(identifier: EntityIdentifier): Promise<DomainEntity | null> {
		const key = identifier.toString();
		try {
			await this.cache.delete({
				key: this.getCacheKey(key)
			});
			const data = await this.removeFromDatabase(identifier);
			return data ? this.toDomain(data) : null;
		} catch (error) {
			// Optionally log error
			throw new Error(`Failed to remove entity: ${error}`);
		}
	}

	/**
	 * Finds an entity by its identifier, using cache if available.
	 * @param identifier - The entity identifier
	 * @returns The domain entity or null if not found
	 */
	public async findById(identifier: EntityIdentifier): Promise<DomainEntity | null> {
		const key = identifier.toString();
		try {
			return await this.cache.getOrSet({
				key: this.getCacheKey(key),
				ttl: this.ttl,
				factory: async () => {
					const data = await this.findInDatabase(identifier);
					return data ? this.toDomain(data) : null;
				}
			});
		} catch (error) {
			// Optionally log error
			throw new Error(`Failed to find entity: ${error}`);
		}
	}

	/**
	 * Persists the entity to the database.
	 * @param entity - The domain entity
	 */
	protected abstract saveToDatabase(entity: DomainEntity): Promise<DataBaseEntity>;

	/**
	 * Removes the entity from the database.
	 * @param identifier - The entity identifier
	 */
	protected abstract removeFromDatabase(identifier: EntityIdentifier): Promise<DataBaseEntity | null>;

	/**
	 * Finds the entity in the database.
	 * @param identifier - The entity identifier
	 * @returns The database entity or null if not found
	 */
	protected abstract findInDatabase(identifier: EntityIdentifier): Promise<DataBaseEntity | null>;

	/**
	 * Maps a database entity to a domain entity.
	 * @param entity - The database entity
	 * @returns The domain entity
	 */
	protected abstract toDomain(entity: DataBaseEntity): DomainEntity;

	/**
	 * Generates a cache key for the entity.
	 * @param key - The entity identifier as string
	 * @returns The cache key
	 */
	protected getCacheKey(key: string): string {
		return `${this.name}:${key}`;
	}
}
