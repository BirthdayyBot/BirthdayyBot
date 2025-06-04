import type { Birthday, BirthdayIdentifier } from '#domain/entities/birthday/birthday';
import type { Repository } from '#domain/repositories/base_repository';
import type { BirthdayRepository } from '#domain/repositories/birthday_repository';
import type { PrismaClient, Birthday as PrismaBirthday } from '@prisma/client';

export class PrismaBirthdayRepository implements BirthdayRepository {
	public constructor(private readonly prisma: PrismaClient) {}

	public async findById(id: BirthdayIdentifier): Promise<Birthday | null> {
		const birthday = await this.prisma.birthday.findUnique({
			where: { userId_guildId: id }
		});
		return birthday ? this.toDomainEntity(birthday) : null;
	}

	public async findByUser(userId: string): Promise<Birthday[]> {
		const birthdays = await this.prisma.birthday.findMany({
			where: { userId }
		});
		return birthdays.map((data) => this.toDomainEntity(data));
	}

	public async findByGuild(guildId: string): Promise<Birthday[]> {
		const birthdays = await this.prisma.birthday.findMany({
			where: { guildId }
		});
		return birthdays.map((data) => this.toDomainEntity(data));
	}

	public async findOrCreate(id: BirthdayIdentifier, data: Repository.CreateData<Birthday>): Promise<Birthday> {
		const birthday = await this.prisma.birthday.upsert({
			where: { userId_guildId: id },
			update: data,
			create: {
				...id,
				...data
			}
		});

		return this.toDomainEntity(birthday);
	}

	public async update(id: BirthdayIdentifier, data: Repository.UpdateData<Birthday>): Promise<Birthday | null> {
		const updateBirthday = await this.prisma.birthday
			.update({
				where: { userId_guildId: id },
				data
			})
			.catch(() => null);
		return updateBirthday ? this.toDomainEntity(updateBirthday) : null;
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
		const birthdays = await this.prisma.birthday.findMany({
			take: limit,
			skip: offset,
			orderBy: { createdAt: 'desc' }
		});
		return birthdays.map((data) => this.toDomainEntity(data));
	}

	public count(): Promise<number> {
		return this.prisma.birthday.count();
	}

	public async createMany(entities: Repository.CreateManyData<Birthday>): Promise<Birthday[]> {
		const createdBirthdays = await this.prisma.birthday.createManyAndReturn({
			data: entities.map((birthday) => ({
				userId: birthday.id.userId,
				guildId: birthday.id.guildId,
				birthday: birthday.birthday,
				disabled: birthday.disabled ?? false
			})),
			skipDuplicates: true // Skip duplicates based on unique constraints
		});

		return createdBirthdays.map((data) => this.toDomainEntity(data));
	}

	private toDomainEntity(data: PrismaBirthday): Birthday {
		return {
			id: {
				userId: data.userId,
				guildId: data.guildId
			},
			birthday: data.birthday,
			disabled: data.disabled ?? false,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt
		};
	}
}
