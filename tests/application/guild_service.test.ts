import { GuildConfigService } from '#application/services/guild_config_service';
import { GuildConfig } from '#domain/entities/guild/guild-config';
import { CacheManager } from '#domain/ports/cache_manager';
import { Repository } from '#domain/repositories/base_repository';
import { GuildConfigRepository } from '#domain/repositories/guild-config_repository';

describe('GuildConfigService', () => {
	const mockRepo = {
		findById: vi.fn(),
		findOrCreate: vi.fn(),
		update: vi.fn(),
		deleteById: vi.fn(),
		findAll: vi.fn(),
		count: vi.fn(),
		createMany: vi.fn()
	} satisfies GuildConfigRepository;
	const mockCache = {
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		invalidate: vi.fn(),
		clear: vi.fn()
	} satisfies CacheManager<string, GuildConfig>;

	const id = '123456789012345678';
	const defaultData = {
		premium: false,
		timezone: 'UTC',
		language: 'en-US'
	};
	const guild = {
		premium: false,
		timezone: 'UTC',
		language: 'en-US'
	} satisfies Repository.CreateData<GuildConfig>;

	beforeEach(() => {
		Object.values(mockRepo).forEach((fn) => fn.mockReset());
		Object.values(mockCache).forEach((fn) => fn.mockReset());
	});

	describe('findOrCreate', () => {
		it('returns from cache if present (cache hit)', async () => {
			mockCache.get.mockResolvedValue(guild);
			const service = new GuildConfigService(mockRepo, mockCache);
			const result = await service.findOrCreate(id, defaultData);
			expect(result).toBe(guild);
			expect(mockRepo.findOrCreate).not.toHaveBeenCalled();
		});

		it('calls repo and sets cache if not present (cache miss)', async () => {
			mockCache.get.mockResolvedValue(null);
			mockRepo.findOrCreate.mockResolvedValue(guild);
			const service = new GuildConfigService(mockRepo, mockCache);
			const result = await service.findOrCreate(id, defaultData);
			expect(result).toBe(guild);
			expect(mockRepo.findOrCreate).toHaveBeenCalledWith(id, defaultData);
			expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), guild);
		});

		it('throws an error if the repo fails', async () => {
			mockCache.get.mockResolvedValue(null);
			mockRepo.findOrCreate.mockRejectedValue(new Error('Repo error'));
			const service = new GuildConfigService(mockRepo, mockCache);
			await expect(service.findOrCreate(id, defaultData)).rejects.toThrow('Repo error');
		});
	});

	describe('update', () => {
		it('invalidates and updates the cache on success (cache miss)', async () => {
			mockRepo.update.mockResolvedValue(guild);
			mockCache.get.mockResolvedValue(null);
			const service = new GuildConfigService(mockRepo, mockCache);
			await service.update(id, { foo: 'baz' } as any);
			expect(mockCache.invalidate).toHaveBeenCalled();
			expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), guild);
		});

		it('updates the cache if present (cache hit)', async () => {
			mockRepo.update.mockResolvedValue(guild);
			mockCache.get.mockResolvedValue(guild);
			const service = new GuildConfigService(mockRepo, mockCache);
			await service.update(id, { foo: 'baz' } as any);
			expect(mockCache.invalidate).toHaveBeenCalled();
			expect(mockCache.set).toHaveBeenCalledWith(expect.any(String), guild);
		});

		it('does not update the cache if the repo returns null', async () => {
			mockRepo.update.mockResolvedValue(null);
			const service = new GuildConfigService(mockRepo, mockCache);
			await service.update(id, { foo: 'baz' } as any);
			expect(mockCache.set).not.toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('removes from cache and calls repo (cache hit)', async () => {
			mockCache.get.mockResolvedValue(guild);
			const service = new GuildConfigService(mockRepo, mockCache);
			await service.delete(id);
			expect(mockRepo.deleteById).toHaveBeenCalledWith(id);
			expect(mockCache.delete).toHaveBeenCalledWith(expect.any(String));
		});

		it('removes from cache and calls repo (cache miss)', async () => {
			mockCache.get.mockResolvedValue(null);
			const service = new GuildConfigService(mockRepo, mockCache);
			await service.delete(id);
			expect(mockRepo.deleteById).toHaveBeenCalledWith(id);
			expect(mockCache.delete).toHaveBeenCalledWith(expect.any(String));
		});
	});
});
