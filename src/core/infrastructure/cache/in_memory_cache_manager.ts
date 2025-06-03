import type { CacheManager } from '#domain/ports/cache_manager';

export class InMemoryCacheManager<K, V> implements CacheManager<K, V> {
	private cache = new Map<K, V>();

	public get(key: K): V | null {
		return this.cache.get(key) ?? null;
	}

	public set(key: K, value: V): void {
		this.cache.set(key, value);
	}

	public delete(key: K): void {
		this.cache.delete(key);
	}

	public invalidate(key: K): void {
		this.delete(key);
	}

	public clear(): void {
		this.cache.clear();
	}
}
