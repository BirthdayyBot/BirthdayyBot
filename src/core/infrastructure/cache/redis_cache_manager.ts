import type { CacheManager } from '#domain/ports/cache_manager';
import { Redis } from 'ioredis';

export class RedisCacheManager<K, V> implements CacheManager<K, V> {
	public constructor(private readonly redisClient: Redis) {}

	public async get(key: K): Promise<V | null> {
		const value = await this.redisClient.get(String(key));
		return value ? (JSON.parse(value) as V) : null;
	}

	public async set(key: K, value: V): Promise<void> {
		await this.redisClient.set(String(key), JSON.stringify(value));
	}

	public async delete(key: K): Promise<void> {
		await this.redisClient.del(String(key));
	}

	public async invalidate(key: K): Promise<void> {
		await this.delete(key);
	}

	public async clear(): Promise<void> {
		await this.redisClient.flushall();
	}
}
