import { Cache } from '#lib/core/domain/cache';
import { RedisCache } from '#lib/core/infrastructure/cache/redis-cache';
import { WeakMapCache } from '#lib/core/infrastructure/cache/weakmap-cache';

export type CacheProvider = 'redis' | 'weakmap';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CacheFactory {
	public static create(provider: CacheProvider): Cache {
		switch (provider) {
			case 'redis':
				return new RedisCache();
			case 'weakmap':
				return new WeakMapCache();
			default:
				throw new Error(`Unknown cache provider: ${provider}`);
		}
	}
}
