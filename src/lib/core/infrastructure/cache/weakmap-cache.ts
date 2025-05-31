import { Cache } from '#lib/core/domain/cache';

export class WeakMapCache implements Cache {
	private cache: Map<string, { value: unknown; expiry?: number }>;

	public constructor() {
		this.cache = new Map();
	}

	public set(key: string, value: unknown, ttl?: number): void {
		const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
		this.cache.set(key, { value, expiry });
	}

	public get<T>(key: string): T | null {
		const item = this.cache.get(key);

		if (!item) {
			return null;
		}

		if (item.expiry && Date.now() > item.expiry) {
			this.cache.delete(key);
			return null;
		}

		return item.value as T;
	}

	public delete(key: string): void {
		this.cache.delete(key);
	}

	public clear(): void {
		this.cache.clear();
	}

	public has(key: string): boolean {
		const item = this.cache.get(key);
		if (!item) {
			return false;
		}
		if (item.expiry && Date.now() > item.expiry) {
			this.cache.delete(key);
			return false;
		}
		return true;
	}
}
