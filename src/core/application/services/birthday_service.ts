import type { Birthday, BirthdayIdentifier } from '#domain/entities/birthday/birthday';
import type { BirthdayRepository } from '#domain/repositories/birthday_repository';
import type { CacheManager } from '#domain/ports/cache_manager';
import type { Repository } from '#domain/repositories/base_repository';

export class BirthdayService {
	public constructor(
		private readonly birthdayRepository: BirthdayRepository,
		private readonly cacheManager: CacheManager<string, Birthday>
	) {}

	public async findOrCreate(id: BirthdayIdentifier, defaultData: Repository.CreateData<Birthday>): Promise<Birthday> {
		const cacheKey = this.getCacheKey(id);
		let birthday = await this.cacheManager.get(cacheKey);
		if (!birthday) {
			birthday = await this.birthdayRepository.findOrCreate(id, defaultData);
			await this.cacheManager.set(cacheKey, birthday);
		}
		return birthday;
	}

	public async update(id: BirthdayIdentifier, data: Repository.UpdateData<Birthday>): Promise<Birthday | null> {
		const updated = await this.birthdayRepository.update(id, data);
		const cacheKey = this.getCacheKey(id);
		if (updated) {
			await this.cacheManager.invalidate(cacheKey);
			await this.cacheManager.set(cacheKey, updated);
		}
		return updated;
	}

	public async delete(id: BirthdayIdentifier): Promise<void> {
		await this.birthdayRepository.deleteById(id);
		const cacheKey = this.getCacheKey(id);
		await this.cacheManager.delete(cacheKey);
	}

	public async find(id: BirthdayIdentifier): Promise<Birthday | null> {
		const cacheKey = this.getCacheKey(id);
		const birthday = await this.cacheManager.get(cacheKey);
		if (birthday) {
			return birthday;
		}
		const found = await this.birthdayRepository.findById(id);
		if (!found) {
			return null;
		}
		await this.cacheManager.set(cacheKey, found);
		return found;
	}

	private getCacheKey(id: BirthdayIdentifier): string {
		return `birthday:${id.userId}:${id.guildId}`;
	}
}
