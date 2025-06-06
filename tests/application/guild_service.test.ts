/* eslint-disable @typescript-eslint/unbound-method */
import { GuildConfigService } from '#application/services/guild_config_service';
import { GuildConfig } from '#domain/entities/guild/guild-config';
import { CacheManager } from '#domain/ports/cache_manager';
import { Repository } from '#domain/repositories/base_repository';
import { GuildConfigRepository } from '#domain/repositories/guild-config_repository';
import { Mock } from 'vitest';

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

describe('GuildConfigService', () => {
	let birthdayRepository: GuildConfigRepository;
	let cacheManager: CacheManager<string, GuildConfig>;
	let service: GuildConfigService;

	beforeEach(() => {
		birthdayRepository = {
			findOrCreate: vi.fn(),
			update: vi.fn(),
			deleteById: vi.fn(),
			findById: vi.fn()
		} as any as GuildConfigRepository;
		cacheManager = {
			get: vi.fn(),
			set: vi.fn(),
			invalidate: vi.fn(),
			delete: vi.fn()
		} as any as CacheManager<string, GuildConfig>;
		service = new GuildConfigService(birthdayRepository, cacheManager);
	});

	it('findOrCreate returns guild config from cache or repository', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(null);
		(birthdayRepository.findOrCreate as any).mockResolvedValueOnce(guild);
		const result = await service.findOrCreate(id, defaultData);
		expect(result).toBe(guild);
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), guild);
	});

	it('update updates the guild config and the cache', async () => {
		(birthdayRepository.update as Mock).mockResolvedValueOnce(guild);
		const result = await service.update(id, defaultData);
		expect(result).toBe(guild);
		expect(cacheManager.invalidate).toHaveBeenCalledWith(expect.any(String));
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), guild);
	});

	it('delete removes the guild config and the cache', async () => {
		await service.delete(id);
		expect(birthdayRepository.deleteById).toHaveBeenCalledWith(id);
		expect(cacheManager.delete).toHaveBeenCalledWith(expect.any(String));
	});

	it('find returns the guild config from cache or repository', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(null);
		(birthdayRepository.findById as Mock).mockResolvedValueOnce(guild);
		const result = await service.find(id);
		expect(result).toBe(guild);
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), guild);
	});

	it('find returns null if the guild config does not exist', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(null);
		(birthdayRepository.findById as Mock).mockResolvedValueOnce(null);
		const result = await service.find(id);
		expect(result).toBeNull();
	});
});
