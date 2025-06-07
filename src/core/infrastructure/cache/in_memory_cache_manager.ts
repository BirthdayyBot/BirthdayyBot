import type { CacheManager } from '#domain/ports/cache_manager';

export class InMemoryCacheManager<V> implements CacheManager<V> {
	private cache = new Map<string, V>();

	public get(key: string): V | null {
		return this.cache.get(key) ?? null;
	}

	public set(key: string, value: V): void {
		this.cache.set(key, value);
	}

	public delete(key: string): void {
		this.cache.delete(key);
	}

	public invalidate(key: string): void {
		this.delete(key);
	}

	public clear(): void {
		this.cache.clear();
	}
}
