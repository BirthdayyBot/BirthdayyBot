import { BaseService } from './base_service.js';
import type { User } from '#domain/entities/user/user';
import type { UserRepository } from '#domain/repositories/user_repository';
import type { CacheManager } from '#domain/ports/cache_manager';

export class UserService extends BaseService<User, UserRepository, CacheManager<User>, string> {
	public constructor(userRepository: UserRepository, cacheManager: CacheManager<User>) {
		super('user', userRepository, cacheManager);
	}
}
