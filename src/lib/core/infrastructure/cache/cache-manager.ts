import type { Cache } from '#lib/core/domain/cache';
import { CacheFactory, type CacheProvider } from '#lib/core/infrastructure/cache/cache-factory';
import type { Awaitable } from '@sapphire/utilities';

export abstract class CacheManager {
	protected cache: Cache;

	public constructor(provider: CacheProvider = 'weakmap') {
		this.cache = CacheFactory.create(provider);
	}

	protected generateKey(prefix: string, ...args: unknown[]): string {
		return `${prefix}:${args.join(':')}`;
	}

	protected async getCachedOrFetch<T>(key: string, fetchFn: () => Awaitable<T>, ttl?: number): Promise<T> {
		const cached = await this.cache.get<T>(key);
		if (cached !== null) {
			return cached;
		}

		const value = await fetchFn();
		await this.cache.set(key, value, ttl);
		return value;
	}

	public abstract clearCache(): Promise<void>;
}
