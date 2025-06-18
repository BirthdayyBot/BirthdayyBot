import type { Birthday, BirthdayCreateInput, BirthdayUpdateInput } from '../Birthday.js';

export interface BirthdayRepository {
	findById(userId: string, guildId: string): Promise<Birthday | null>;
	findByDate(date: string): Promise<Birthday[]>;
	findByGuild(guildId: string): Promise<Birthday[]>;
	create(data: BirthdayCreateInput): Promise<Birthday>;
	update(userId: string, guildId: string, data: BirthdayUpdateInput): Promise<Birthday>;
	delete(userId: string, guildId: string): Promise<boolean>;
}
