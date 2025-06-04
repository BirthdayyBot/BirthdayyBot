import { BirthdayService } from '#application/services/birthday_service';
import { BirthdayRepository } from '../../src/core/domain/repositories/birthday_repository.js';
import { CacheManager } from '../../src/core/domain/ports/cache_manager.js';
import { Birthday } from '#domain/entities/birthday/birthday';
import { Repository } from '#domain/repositories/base_repository';

describe('BirthdayService', () => {
	const mockRepo = {
		findById: vi.fn(),
		findOrCreate: vi.fn(),
		update: vi.fn(),
		deleteById: vi.fn(),
		findByUser: vi.fn(),
		findByGuild: vi.fn(),
		findAll: vi.fn(),
		count: vi.fn(),
		createMany: vi.fn()
	} satisfies BirthdayRepository;
	const mockCache = {
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		invalidate: vi.fn(),
		clear: vi.fn()
	} satisfies CacheManager<string, Birthday>;

	const id = { userId: 'u', guildId: 'g' };
	const defaultData = {
		birthday: '2023-10-01'
	};
	const birthday = {
		...id,
		birthday: '2023-10-01'
	} satisfies Repository.CreateData<Birthday>;

	beforeEach(() => {
		Object.values(mockRepo).forEach((fn) => fn.mockReset());
		Object.values(mockCache).forEach((fn) => fn.mockReset());
	});

	describe('findOrCreate', () => {
		it('returns from cache if present (cache hit)', async () => {
			mockCache.get.mockResolvedValue(birthday);
			const service = new BirthdayService(mockRepo, mockCache);
			const result = await service.findOrCreate(id, defaultData);
			expect(result).toBe(birthday);
			expect(mockRepo.findOrCreate).not.toHaveBeenCalled();
		});

		it('calls repo and sets cache if not present (cache miss)', async () => {
			mockCache.get.mockResolvedValue(null);
			mockRepo.findOrCreate.mockResolvedValue(birthday);
			const service = new BirthdayService(mockRepo, mockCache);
			const result = await service.findOrCreate(id, defaultData);
			expect(result).toBe(birthday);
			expect(mockRepo.findOrCreate).toHaveBeenCalledWith(id, defaultData);
			expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), birthday);
		});

		it('throws an error if the repo fails', async () => {
			mockCache.get.mockResolvedValue(null);
			mockRepo.findOrCreate.mockRejectedValue(new Error('Repo error'));
			const service = new BirthdayService(mockRepo, mockCache);
			await expect(service.findOrCreate(id, defaultData)).rejects.toThrow('Repo error');
		});
	});

	describe('update', () => {
		it('invalidates and updates the cache on success (cache miss)', async () => {
			mockRepo.update.mockResolvedValue(birthday);
			mockCache.get.mockResolvedValue(null);
			const service = new BirthdayService(mockRepo, mockCache);
			await service.update(id, { foo: 'baz' } as any);
			expect(mockCache.invalidate).toHaveBeenCalled();
			expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), birthday);
		});

		it('updates the cache if present (cache hit)', async () => {
			mockRepo.update.mockResolvedValue(birthday);
			mockCache.get.mockResolvedValue(birthday);
			const service = new BirthdayService(mockRepo, mockCache);
			await service.update(id, { foo: 'baz' } as any);
			expect(mockCache.invalidate).toHaveBeenCalled();
			expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), birthday);
		});

		it('does not update the cache if the repo returns null', async () => {
			mockRepo.update.mockResolvedValue(null);
			const service = new BirthdayService(mockRepo, mockCache);
			await service.update(id, { foo: 'baz' } as any);
			expect(mockCache.set).not.toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('removes from cache and calls repo (cache hit)', async () => {
			mockCache.get.mockResolvedValue(birthday);
			const service = new BirthdayService(mockRepo, mockCache);
			await service.delete(id);
			expect(mockRepo.deleteById).toHaveBeenCalledWith(id);
			expect(mockCache.delete).toHaveBeenCalledWith(expect.any(String));
		});

		it('removes from cache and calls repo (cache miss)', async () => {
			mockCache.get.mockResolvedValue(null);
			const service = new BirthdayService(mockRepo, mockCache);
			await service.delete(id);
			expect(mockRepo.deleteById).toHaveBeenCalledWith(id);
			expect(mockCache.delete).toHaveBeenCalledWith(expect.any(String));
		});
	});
});
