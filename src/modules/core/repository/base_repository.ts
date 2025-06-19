// TODO: Add cache support
export abstract class BaseRepository<T, K = string> {
	// CRUD: Create
	public async create(key: K, entity: T): Promise<T> {
		return this.createInSource(key, entity);
	}

	// CRUD: Read (find)
	public async find(key: K): Promise<T | null> {
		return this.findFromSource(key);
	}

	// CRUD: Update
	public async update(key: K, entity: T): Promise<T> {
		return this.updateInSource(key, entity);
	}

	// CRUD: Delete
	public async delete(key: K): Promise<void> {
		await this.deleteFromSource(key);
	}

	// Protected functions to be implemented by subclasses
	protected abstract createInSource(key: K, entity: T): Promise<T>;
	protected abstract findFromSource(key: K): Promise<T | null>;
	protected abstract updateInSource(key: K, entity: T): Promise<T>;
	protected abstract deleteFromSource(key: K): Promise<void>;
}
