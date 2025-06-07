import type { BaseRepository, Repository } from '#domain/repositories/base_repository';
import type { Entity } from '#domain/entities/base/entity';
import type { CacheManager } from '#domain/ports/cache_manager';

export class BaseService<
	E extends Entity<Id>,
	R extends BaseRepository<E, Id>,
	C extends CacheManager<E>,
	Id extends string | object = string
> {
	public constructor(
		protected readonly name: string,
		protected readonly repository: R,
		protected readonly cacheManager: C
	) {}

	public async findOrCreate(
		id: Id,
		defaultData: Repository.CreateData<E>,
		select?: (keyof E)[]
	): Promise<Partial<E>> {
		const cacheKey = this.getCacheKey(id);
		let entity = await this.cacheManager.get(cacheKey);
		if (!entity) {
			entity = await this.repository.findOrCreate(id, defaultData);
			await this.cacheManager.set(cacheKey, entity);
		}
		return select ? this.pickFields(entity, select) : entity;
	}

	public async update(id: Id, data: Repository.UpdateData<E>, select?: (keyof E)[]): Promise<Partial<E> | null> {
		const updated = await this.repository.update(id, data);
		const cacheKey = this.getCacheKey(id);
		if (updated) {
			await this.cacheManager.invalidate(cacheKey);
			await this.cacheManager.set(cacheKey, updated);
			return select ? this.pickFields(updated, select) : updated;
		}
		return null;
	}

	public async delete(id: Id): Promise<void> {
		await this.repository.deleteById(id);
		const cacheKey = this.getCacheKey(id);
		await this.cacheManager.delete(cacheKey);
	}

	public async find(id: Id, select?: (keyof E)[]): Promise<Partial<E> | null> {
		const cacheKey = this.getCacheKey(id);
		let entity = await this.cacheManager.get(cacheKey);
		if (!entity) {
			entity = await this.repository.findById(id);
			if (!entity) return null;
			await this.cacheManager.set(cacheKey, entity);
		}
		return select ? this.pickFields(entity, select) : entity;
	}

	/**
	 * Generates a cache key based on the entity ID.
	 * If the ID is an object, it constructs a key from its properties.
	 * @param id - The ID of the entity can be a string or an object.
	 * @returns A string representing the cache key.
	 * @exemple
	 * getCacheKey('user1'); // returns 'serviceName:user1'
	 * getCacheKey({ userId: 'user1', guildId: 'guild1' }); // returns 'serviceName:user1:guild1'
	 */
	protected getCacheKey(id: Id): string {
		if (typeof id === 'string') {
			return `${this.name}:${id}`;
		} else if (typeof id === 'object' && id !== null) {
			const values = Object.values(id);
			return `${this.name}:${values.join(':')}`;
		}
		throw new Error(`Invalid ID type for cache key: ${typeof id}`);
	}

	private pickFields<T>(entity: T, fields: (keyof T)[]): Partial<T> {
		const result: Partial<T> = {};
		for (const key of fields) {
			result[key] = entity[key];
		}
		return result;
	}
}
