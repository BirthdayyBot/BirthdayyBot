export type Awaitable<T> = T | Promise<T>;

export interface CacheManager<K, V> {
	get(key: K): Awaitable<V | null>;

	set(key: K, value: V): Awaitable<void>;

	delete(key: K): Awaitable<void>;

	/**
	 * Invalide explicitement la clé du cache (alias de delete, mais plus explicite pour l'invalidation)
	 * @param key - La clé à invalider
	 */
	invalidate(key: K): Awaitable<void>;

	clear(): Awaitable<void>;
}
