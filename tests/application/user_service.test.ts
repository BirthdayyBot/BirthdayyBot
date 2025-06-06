/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserService } from '#application/services/user_service';
import type { User } from '#domain/entities/user/user';
import type { UserRepository } from '#domain/repositories/user_repository';
import type { CacheManager } from '#domain/ports/cache_manager';
import type { Repository } from '#domain/repositories/base_repository';

const mockUser: User = {
	id: 'user1'
} as User;

describe('UserService', () => {
	let userRepository: UserRepository;
	let cacheManager: CacheManager<string, User>;
	let service: UserService;

	beforeEach(() => {
		userRepository = {
			findOrCreate: vi.fn(),
			update: vi.fn(),
			deleteById: vi.fn(),
			findById: vi.fn()
		} as any;
		cacheManager = {
			get: vi.fn(),
			set: vi.fn(),
			invalidate: vi.fn(),
			delete: vi.fn()
		} as any;
		service = new UserService(userRepository, cacheManager);
	});

	it('findOrCreate returns the user from cache or repository', async () => {
		(cacheManager.get as any).mockResolvedValueOnce(null);
		(userRepository.findOrCreate as any).mockResolvedValueOnce(mockUser);
		const result = await service.findOrCreate('user1', {} as Repository.CreateData<User>);
		expect(result).toBe(mockUser);
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), mockUser);
	});

	it('update updates the user and the cache', async () => {
		(userRepository.update as any).mockResolvedValueOnce(mockUser);
		const result = await service.update('user1', {} as Repository.UpdateData<User>);
		expect(result).toBe(mockUser);
		expect(cacheManager.invalidate).toHaveBeenCalled();
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), mockUser);
	});

	it('delete removes the user and the cache', async () => {
		await service.delete('user1');
		expect(userRepository.deleteById).toHaveBeenCalledWith('user1');
		expect(cacheManager.delete).toHaveBeenCalledWith(expect.any(String));
	});

	it('find returns the user from cache or repository', async () => {
		(cacheManager.get as any).mockResolvedValueOnce(null);
		(userRepository.findById as any).mockResolvedValueOnce(mockUser);
		const result = await service.find('user1');
		expect(result).toBe(mockUser);
		// eslint-disable-next-line
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), mockUser);
	});

	it('find returns null if the user does not exist', async () => {
		(cacheManager.get as any).mockResolvedValueOnce(null);
		(userRepository.findById as any).mockResolvedValueOnce(null);
		const result = await service.find('user2');
		expect(result).toBeNull();
	});
});
