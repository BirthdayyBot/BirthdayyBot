/* eslint-disable @typescript-eslint/unbound-method */
import { BirthdayService } from '#application/services/birthday_service';
import { BirthdayRepository } from '#domain/repositories/birthday_repository';
import { CacheManager } from '#domain/ports/cache_manager';
import { Birthday } from '#domain/entities/birthday/birthday';
import { Repository } from '#domain/repositories/base_repository';
import { beforeEach, Mock, vi } from 'vitest';

const id = { userId: 'u', guildId: 'g' };
const defaultData = {
	birthday: '2023-10-01'
};
const birthday = {
	...id,
	birthday: '2023-10-01'
} satisfies Repository.CreateData<Birthday>;

describe('BirthdayService', () => {
	let birthdayRepository: BirthdayRepository;
	let cacheManager: CacheManager<string, Birthday>;
	let service: BirthdayService;

	beforeEach(() => {
		birthdayRepository = {
			findOrCreate: vi.fn(),
			update: vi.fn(),
			deleteById: vi.fn(),
			findById: vi.fn()
		} as any as BirthdayRepository;
		cacheManager = {
			get: vi.fn(),
			set: vi.fn(),
			invalidate: vi.fn(),
			delete: vi.fn()
		} as any as CacheManager<string, Birthday>;
		service = new BirthdayService(birthdayRepository, cacheManager);
	});

	it('findOrCreate returns birthday from cache or repository', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(null);
		(birthdayRepository.findOrCreate as any).mockResolvedValueOnce(birthday);
		const result = await service.findOrCreate(id, defaultData);
		expect(result).toBe(birthday);
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), birthday);
	});
	it('update updates the birthday and the cache', async () => {
		(birthdayRepository.update as Mock).mockResolvedValueOnce(birthday);
		const result = await service.update(id, defaultData);
		expect(result).toBe(birthday);
		expect(cacheManager.invalidate).toHaveBeenCalledWith(expect.any(String));
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), birthday);
	});
	it('delete removes the birthday and the cache', async () => {
		await service.delete(id);
		expect(birthdayRepository.deleteById).toHaveBeenCalledWith(id);
		expect(cacheManager.delete).toHaveBeenCalledWith(expect.any(String));
	});
	it('find returns the birthday from cache or repository', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(null);
		(birthdayRepository.findById as Mock).mockResolvedValueOnce(birthday);
		const result = await service.find(id);
		expect(result).toBe(birthday);
		expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), birthday);
	});
	it('find returns null if the birthday does not exist', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(null);
		(birthdayRepository.findById as Mock).mockResolvedValueOnce(null);
		const result = await service.find(id);
		expect(result).toBeNull();
	});
	it('find returns null if the birthday does not exist in cache', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(null);
		(birthdayRepository.findById as Mock).mockResolvedValueOnce(null);
		const result = await service.find(id);
		expect(result).toBeNull();
	});
	it('find returns birthday from cache if available', async () => {
		(cacheManager.get as Mock).mockResolvedValueOnce(birthday);
		const result = await service.find(id);
		expect(result).toBe(birthday);
		expect(cacheManager.set).not.toHaveBeenCalled();
	});
});
