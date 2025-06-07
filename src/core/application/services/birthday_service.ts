import { BaseService } from './base_service.js';
import type { Birthday, BirthdayIdentifier } from '#domain/entities/birthday/birthday';
import type { BirthdayRepository } from '#domain/repositories/birthday_repository';
import type { CacheManager } from '#domain/ports/cache_manager';

export class BirthdayService extends BaseService<
	Birthday,
	BirthdayRepository,
	CacheManager<Birthday>,
	BirthdayIdentifier
> {
	public constructor(birthdayRepository: BirthdayRepository, cacheManager: CacheManager<Birthday>) {
		super('birthday', birthdayRepository, cacheManager);
	}
}
