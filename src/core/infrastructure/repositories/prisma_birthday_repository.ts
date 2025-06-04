import type { Birthday, BirthdayIdentifier } from '#domain/entities/birthday/birthday';
import type { Repository } from '#domain/repositories/base_repository';
import type { BirthdayRepository } from '#domain/repositories/birthday_repository';
import type { PrismaClient } from '@prisma/client';

export class PrismaBirthdayRepository implements BirthdayRepository {
	public constructor(private readonly prisma: PrismaClient) {}

	public async findById(id: BirthdayIdentifier): Promise<Birthday | null> {
		const birthday = await this.prisma.birthday.findUnique({
			where: { userId_guildId: id }
		});
		return birthday ? birthday : null;
	}

	public async findByUser(userId: string): Promise<Birthday[]> {
		return this.prisma.birthday.findMany({
			where: { userId }
		});
	}

	public async findByGuild(guildId: string): Promise<Birthday[]> {
		return this.prisma.birthday.findMany({
			where: { guildId }
		});
	}

	public async findOrCreate(id: BirthdayIdentifier, data: Repository.CreateData<Birthday>): Promise<Birthday> {
		return this.prisma.birthday.upsert({
			where: { userId_guildId: id },
			update: data,
			create: {
				userId: id.userId,
				guildId: id.guildId,
				birthday: data.birthday,
				disabled: data.disabled ?? false
			}
		});
	}

	public update(id: BirthdayIdentifier, data: Repository.UpdateData<Birthday>): Promise<Birthday | null> {
		return this.prisma.birthday.update({
			where: { userId_guildId: id },
			data
		});
	}

	public async deleteById(id: BirthdayIdentifier): Promise<void> {
		const deleted = await this.prisma.birthday
			.delete({
				where: { userId_guildId: id }
			})
			.catch(() => null);

		if (!deleted) {
			throw new Error(`Birthday with userId ${id.userId} and guildId ${id.guildId} not found.`);
		}

		return Promise.resolve();
	}

	public async findAll(options?: Repository.PaginationOptions): Promise<Birthday[]> {
		const { limit, offset } = options || {};
		return this.prisma.birthday.findMany({
			take: limit,
			skip: offset,
			orderBy: { createdAt: 'desc' }
		});
	}

	public count(): Promise<number> {
		return this.prisma.birthday.count();
	}

	public async createMany(entities: Repository.CreateData<Birthday>[]): Promise<Birthday[]> {
		return this.prisma.birthday.createManyAndReturn({
			data: entities,
			skipDuplicates: true // Skip duplicates based on unique constraints
		});
	}
}
