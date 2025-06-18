import type { Birthday, BirthdayCreateInput } from '../Birthday.js';
import type { BirthdayRepository } from '../ports/BirthdayRepository.js';

export class BirthdayService {
	public constructor(private readonly repository: BirthdayRepository) {}

	public async getBirthday(userId: string, guildId: string): Promise<Birthday | null> {
		return this.repository.findById(userId, guildId);
	}

	public async setBirthday(data: BirthdayCreateInput): Promise<Birthday> {
		const existing = await this.repository.findById(data.userId, data.guildId);
		if (existing) {
			return this.repository.update(data.userId, data.guildId, { birthday: data.birthday });
		}
		return this.repository.create(data);
	}

	public async removeBirthday(userId: string, guildId: string): Promise<boolean> {
		return this.repository.delete(userId, guildId);
	}

	public async getTodayBirthdays(date: string): Promise<Birthday[]> {
		return this.repository.findByDate(date);
	}
}
