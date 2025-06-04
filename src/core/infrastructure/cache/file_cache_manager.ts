import type { CacheManager } from '#domain/ports/cache_manager';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

export class FileCacheManager<K, V> implements CacheManager<K, V> {
	private readonly cacheDir: string;

	public constructor(cacheDir: string) {
		this.cacheDir = cacheDir;
	}

	public async get(key: K): Promise<V | null> {
		const filePath = this.getFilePath(key);
		try {
			const data = await fs.readFile(filePath, 'utf8');
			return JSON.parse(data) as V;
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
			throw err;
		}
	}

	public async set(key: K, value: V): Promise<void> {
		const filePath = this.getFilePath(key);
		await fs.mkdir(this.cacheDir, { recursive: true });
		await fs.writeFile(filePath, JSON.stringify(value), 'utf8');
	}

	public async delete(key: K): Promise<void> {
		const filePath = this.getFilePath(key);
		try {
			await fs.unlink(filePath);
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
		}
	}

	public async invalidate(key: K): Promise<void> {
		await this.delete(key);
	}

	public async clear(): Promise<void> {
		try {
			const files = await fs.readdir(this.cacheDir);
			await Promise.all(files.filter((f) => f.endsWith('.json')).map((f) => fs.unlink(join(this.cacheDir, f))));
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
		}
	}

	private getFilePath(key: K): string {
		return join(this.cacheDir, `${encodeURIComponent(String(key))}.json`);
	}
}
