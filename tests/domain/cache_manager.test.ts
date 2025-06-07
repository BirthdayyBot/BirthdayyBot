import type { CacheManager } from '#domain/ports/cache_manager';

describe('CacheManager (contract)', () => {
	class DummyCacheManager implements CacheManager<string, number> {
		private store = new Map<string, number>();

		public get(key: string): number | null {
			return this.store.get(key) ?? null;
		}

		public set(key: string, value: number): void {
			this.store.set(key, value);
		}

		public delete(key: string): void {
			this.store.delete(key);
		}

		public invalidate(key: string): void {
			this.delete(key);
		}

		public clear(): void {
			this.store.clear();
		}
	}

	it('should implement the CacheManager interface', () => {
		const cache = new DummyCacheManager();
		cache.set('a', 1);
		expect(cache.get('a')).toBe(1);

		cache.delete('a');
		expect(cache.get('a')).toBeNull();

		cache.set('b', 2);
		cache.invalidate('b');
		expect(cache.get('b')).toBeNull();

		cache.set('c', 3);
		cache.clear();
		expect(cache.get('c')).toBeNull();
	});
});
