export type Awaitable<T> = T | Promise<T>;

export interface CacheManager<V> {
	get(key: string): Awaitable<V | null>;

	set(key: string, value: V): Awaitable<void>;

	delete(key: string): Awaitable<void>;

	/**
	 * Invalide explicitement la clé du cache (alias de delete, mais plus explicite pour l'invalidation)
	 * @param key - La clé à invalider
	 */
	invalidate(key: string): Awaitable<void>;

	clear(): Awaitable<void>;
}
