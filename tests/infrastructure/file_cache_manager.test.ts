import { FileCacheManager } from '#infrastructure/cache/file_cache_manager';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

describe('FileCacheManager', () => {
	let cacheDir: string;
	let cache: FileCacheManager<any>;

	beforeAll(() => {
		cacheDir = join(__dirname, `test-cache-${randomUUID()}`);
		mkdirSync(cacheDir, { recursive: true });
	});

	afterAll(() => {
		rmSync(cacheDir, { recursive: true, force: true });
	});

	beforeEach(() => {
		cache = new FileCacheManager(cacheDir);
	});

	afterEach(async () => {
		await cache.clear();
	});

	it('set and get a value', async () => {
		await cache.set('foo', { bar: 42 });
		const value = await cache.get('foo');
		expect(value).toEqual({ bar: 42 });
	});

	it('returns null for missing key', async () => {
		const value = await cache.get('missing');
		expect(value).toBeNull();
	});

	it('overwrites existing value', async () => {
		await cache.set('foo', 1);
		await cache.set('foo', 2);
		const value = await cache.get('foo');
		expect(value).toBe(2);
	});

	it('delete removes the value', async () => {
		await cache.set('baz', 123);
		await cache.delete('baz');
		const value = await cache.get('baz');
		expect(value).toBeNull();
	});

	it('invalidate is an alias for delete', async () => {
		await cache.set('x', 1);
		await cache.invalidate('x');
		const value = await cache.get('x');
		expect(value).toBeNull();
	});

	it('clear removes all files', async () => {
		await cache.set('a', 1);
		await cache.set('b', 2);
		await cache.clear();
		const a = await cache.get('a');
		const b = await cache.get('b');
		expect(a).toBeNull();
		expect(b).toBeNull();
		// Optionally check directory is empty
		const files = readdirSync(cacheDir);
		expect(files.length).toBe(0);
	});
});
