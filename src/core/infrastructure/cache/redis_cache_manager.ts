import type { CacheManager } from '#domain/ports/cache_manager';
import { Redis } from 'ioredis';

export class RedisCacheManager<V> implements CacheManager<V> {
	public constructor(private readonly redisClient: Redis) {}

	public async get(key: string): Promise<V | null> {
		const value = await this.redisClient.get(key);
		return value ? (JSON.parse(value) as V) : null;
	}

	public async set(key: string, value: V): Promise<void> {
		await this.redisClient.set(String(key), JSON.stringify(value));
	}

	public async delete(key: string): Promise<void> {
		await this.redisClient.del(key);
	}

	public async invalidate(key: string): Promise<void> {
		await this.delete(key);
	}

	public async clear(): Promise<void> {
		await this.redisClient.flushall();
	}
}
