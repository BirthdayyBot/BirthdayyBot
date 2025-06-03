import type { User } from '#domain/entities/user/user';
import type { UserRepository } from '#domain/repositories/user_repository';
import type { CacheManager } from '#domain/ports/cache_manager';
import type { Repository } from '#domain/repositories/base_repository';

export class UserService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly cacheManager: CacheManager<string, User>
	) {}

	public async findOrCreate(userId: string, defaultData: Repository.CreateData<User>): Promise<User> {
		const cacheKey = this.getCacheKey(userId);
		let user = await this.cacheManager.get(cacheKey);
		if (!user) {
			user = await this.userRepository.findOrCreate(userId, defaultData);
			await this.cacheManager.set(cacheKey, user);
		}
		return user;
	}

	public async update(userId: string, data: Repository.UpdateData<User>): Promise<User | null> {
		const updated = await this.userRepository.update(userId, data);
		const cacheKey = this.getCacheKey(userId);
		if (updated) {
			await this.cacheManager.invalidate(cacheKey);
			await this.cacheManager.set(cacheKey, updated);
		}
		return updated;
	}

	public async delete(userId: string): Promise<void> {
		await this.userRepository.deleteById(userId);
		const cacheKey = this.getCacheKey(userId);
		await this.cacheManager.delete(cacheKey);
	}

	public async find(userId: string): Promise<User | null> {
		const cacheKey = this.getCacheKey(userId);
		let user = await this.cacheManager.get(cacheKey);
		if (!user) {
			user = await this.userRepository.findById(userId);
			if (!user) return null;
			await this.cacheManager.set(cacheKey, user);
		}
		return user;
	}

	private getCacheKey(userId: string): string {
		return `user:${userId}`;
	}
}
