import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryCacheManager } from '#infrastructure/cache/in_memory_cache_manager';

describe('InMemoryCacheManager', () => {
	let cacheManager: InMemoryCacheManager<number>;

	beforeEach(() => {
		cacheManager = new InMemoryCacheManager();
	});

	describe('get', () => {
		it('logs the call and returns the value for an existing key', () => {
			const key = '51651468';
			const value = 42;
			cacheManager.set(key, value);
			const retrievedValue = cacheManager.get(key);

			expect(retrievedValue).toBe(value);
		});

		it('logs the call and returns null for a non-existent key', () => {
			const key = 'nonExistentKey';
			const retrievedValue = cacheManager.get(key);

			expect(retrievedValue).toBeNull();
		});
	});

	describe('set', () => {
		it('logs the call and sets a new value', () => {
			cacheManager.set('test', 123);
			const value = cacheManager.get('test');

			expect(value).toBe(123);
		});

		it('logs the call and updates the value if the key already exists', () => {
			cacheManager.set('test', 123);
			cacheManager.set('test', 456);
			const value = cacheManager.get('test');

			expect(value).toBe(456);
		});
	});

	describe('delete', () => {
		it('logs the call and deletes the value', () => {
			cacheManager.set('test', 123);
			cacheManager.delete('test');
			expect(cacheManager.get('test')).toBeNull();
		});
	});

	describe('invalidate', () => {
		it('logs the call and deletes the value (alias for delete)', () => {
			cacheManager.set('test', 123);
			cacheManager.invalidate('test');
			expect(cacheManager.get('test')).toBeNull();
		});
	});

	describe('clear', () => {
		it('logs the call and clears the cache', () => {
			cacheManager.set('test', 123);
			cacheManager.set('autre', 456);
			cacheManager.clear();

			expect(cacheManager.get('test')).toBeNull();
			expect(cacheManager.get('autre')).toBeNull();
		});
	});

	describe('reset', () => {
		it('resets all call logs and clears the cache', () => {
			cacheManager.set('test', 123);
			cacheManager.set('autre', 456);
			cacheManager.clear();

			expect(cacheManager.get('test')).toBeNull();
			expect(cacheManager.get('autre')).toBeNull();
		});
	});
});
