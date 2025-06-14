import type { BaseRepository, Repository } from '#domain/repositories/base_repository';
import type { Entity } from '#domain/entities/base/entity';
import type { CacheManager } from '#domain/ports/cache_manager';

export class BaseService<
	EntityModel extends Entity<Id>,
	EntityRepository extends BaseRepository<EntityModel, Id>,
	CacheStrategy extends CacheManager<EntityModel>,
	Id extends string | object = string
> {
	public constructor(
		protected readonly name: string,
		protected readonly repository: EntityRepository,
		protected readonly cacheManager: CacheStrategy
	) {}

	public async findOrCreate(id: Id, defaultData: Repository.CreateData<EntityModel>): Promise<EntityModel> {
		const cacheKey = this.getCacheKey(id);
		let entity = await this.cacheManager.get(cacheKey);
		if (!entity) {
			entity = await this.repository.findOrCreate(id, defaultData);
			await this.cacheManager.set(cacheKey, entity);
		}
		return entity;
	}

	public async update(id: Id, data: Repository.UpdateData<EntityModel>): Promise<EntityModel | null> {
		const updated = await this.repository.update(id, data);
		const cacheKey = this.getCacheKey(id);
		if (updated) {
			await this.cacheManager.invalidate(cacheKey);
			await this.cacheManager.set(cacheKey, updated);
			return updated;
		}
		return null;
	}

	public async delete(id: Id): Promise<void> {
		await this.repository.deleteById(id);
		const cacheKey = this.getCacheKey(id);
		await this.cacheManager.delete(cacheKey);
	}

	public async find(id: Id): Promise<EntityModel | null> {
		const cacheKey = this.getCacheKey(id);
		let entity = await this.cacheManager.get(cacheKey);
		if (!entity) {
			entity = await this.repository.findById(id);
			if (!entity) return null;
			await this.cacheManager.set(cacheKey, entity);
		}
		return entity;
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
		if (typeof id === 'string') return `${this.name}:${id}`;

		return `${this.name}:${Object.values(id).join(':')}`;
	}
}

export type SelectFields<E, T extends readonly (keyof E)[]> = Pick<E, T[number]>;
