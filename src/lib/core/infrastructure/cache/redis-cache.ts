import type { Cache } from '#lib/core/domain/cache';
import { redis } from '#lib/setup/redis';
import { Redis } from 'ioredis';

export class RedisCache implements Cache {
	private client: Redis;

	public constructor() {
		this.client = redis;
	}

	public async set(key: string, value: unknown, ttl?: number): Promise<void> {
		const serializedValue = JSON.stringify(value);
		if (ttl) {
			await this.client.setex(key, ttl, serializedValue);
		} else {
			await this.client.set(key, serializedValue);
		}
	}

	public async get<T>(key: string): Promise<T | null> {
		const value = await this.client.get(key);
		if (!value) return null;
		return JSON.parse(value) as T;
	}

	public async delete(key: string): Promise<void> {
		await this.client.del(key);
	}

	public async clear(): Promise<void> {
		await this.client.flushdb();
	}

	public async has(key: string): Promise<boolean> {
		return (await this.client.exists(key)) === 1;
	}
}
