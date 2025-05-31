import type { Awaitable } from '@sapphire/utilities';

export abstract class Cache {
	public abstract set(key: string, value: unknown, ttl?: number): Awaitable<void>;
	public abstract get<T>(key: string): Awaitable<T | null>;
	public abstract delete(key: string): Awaitable<void>;
	public abstract clear(): Awaitable<void>;
	public abstract has(key: string): Awaitable<boolean>;
}
