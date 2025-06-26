import { Birthday } from '#birthday/domain/birthday';
import { BirthdayIdentifier } from '#birthday/domain/birthday_identifier';
import { BaseRepository } from '#core/repository/base_repository';
import { prisma } from '#core/services/prisma';
import type { Birthday as PrismaBirthday } from '@prisma/client';

export class BirthdayRepository extends BaseRepository<BirthdayIdentifier, Birthday, PrismaBirthday> {
	public constructor() {
		super('birthday', 'multitier');
	}

	public findByMonth(guildId: string, month: number): Promise<Birthday[]> {
		return this.cache.getOrSet({
			key: this.getCacheKey(`month:${guildId}:${month}`),
			ttl: 3600,
			factory: async () => {
				const entities = await this.findMonthInDatabase(guildId, month);
				return entities.map(this.toDomain.bind(this));
			}
		});
	}

	public findUpcoming(guildId: string, limit = 10): Promise<Birthday[]> {
		return this.cache.getOrSet({
			key: this.getCacheKey(`upcoming:${guildId}:${limit}`),
			ttl: 3600,
			factory: async () => {
				const entities = await this.findUpcomingInDatabase(guildId, limit);
				return entities.map(this.toDomain.bind(this));
			}
		});
	}

	protected toDomain(entity: PrismaBirthday): Birthday {
		return Birthday.create({
			id: BirthdayIdentifier.fromStrings(entity.userId, entity.guildId),
			birthday: entity.birthday,
			disabled: entity.disabled,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt
		});
	}

	protected saveToDatabase(entity: Birthday): Promise<PrismaBirthday> {
		const { identifier } = entity;
		const data = {
			birthday: entity.getBirthday(),
			disabled: entity.isDisabled()
		};
		return prisma.birthday.upsert({
			where: {
				userId_guildId: {
					userId: identifier.userId,
					guildId: identifier.guildId
				}
			},
			update: data,
			create: {
				userId: identifier.userId,
				guildId: identifier.guildId,
				...data
			}
		});
	}

	protected async removeFromDatabase(identifier: BirthdayIdentifier): Promise<PrismaBirthday | null> {
		const { userId, guildId } = identifier;

		const birthday = await prisma.birthday
			.delete({
				where: {
					userId_guildId: { userId, guildId }
				}
			})
			.catch(() => null);

		return birthday;
	}

	protected findInDatabase(identifier: BirthdayIdentifier): Promise<PrismaBirthday | null> {
		const { userId, guildId } = identifier;
		return prisma.birthday.findUnique({
			where: {
				userId_guildId: { userId, guildId }
			}
		});
	}

	protected findMonthInDatabase(guildId: string, month: number): Promise<PrismaBirthday[]> {
		const monthStr = month.toString().padStart(2, '0');
		return prisma.birthday.findMany({
			where: {
				guildId,
				birthday: {
					contains: `-${monthStr}-`
				}
			}
		});
	}

	protected findUpcomingInDatabase(guildId: string, limit: number): Promise<PrismaBirthday[]> {
		return prisma.birthday.findMany({
			where: {
				guildId,
				disabled: false
			},
			orderBy: {
				birthday: 'asc'
			},
			take: limit
		});
	}
}
