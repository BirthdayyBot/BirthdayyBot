import { bento } from '#root/modules/core/services/cache';
import { prisma } from '#root/modules/core/services/prisma';
import type { Birthday as PrismaBirthday } from '@prisma/client';
import { Birthday } from '../domain/birthday.js';
import { BirthdayIdentifier } from '../domain/birthday_identifier.js';

interface StoreBirthdayDTO {
	birthday: string;
}

interface UpdateBirthdayDTO {
	userId: string;
	guildId: string;
	birthday: string;
	disabled?: boolean;
}

export class BirthdayRepository {
	public async allByGuild(guildId: string): Promise<Birthday[]> {
		const birthdays = await bento.getOrSet({
			key: `birthdays:${guildId}`,
			factory: () => {
				return prisma.birthday.findMany({
					where: { guildId }
				});
			},
			ttl: 60 * 60 // Cache for 1 hour
		});

		return birthdays.map((birthday) => this.toDomain(birthday));
	}

	public async allByUser(userId: string): Promise<Birthday[]> {
		const birthdays = await bento.getOrSet({
			key: `birthdays:user:${userId}`,
			factory: () => {
				return prisma.birthday.findMany({
					where: { userId }
				});
			},
			ttl: 60 * 60 // Cache for 1 hour
		});
		return birthdays.map((birthday) => this.toDomain(birthday));
	}

	public async findById(id: BirthdayIdentifier): Promise<Birthday | null> {
		const birthdayRecord = await bento.getOrSet({
			key: this.getCacheKey(id),
			factory: () => {
				return prisma.birthday.findUnique({
					where: {
						userId_guildId: {
							guildId: id.guildId.toString(),
							userId: id.userId.toString()
						}
					}
				});
			},
			ttl: 60 * 60 // Cache for 1 hour
		});

		if (!birthdayRecord) {
			return null;
		}

		return this.toDomain(birthdayRecord);
	}

	public async create(payload: StoreBirthdayDTO, userId: string, guildId: string): Promise<Birthday> {
		const birthdayRecord = await prisma.birthday.create({
			data: {
				userId,
				guildId,
				birthday: payload.birthday
			}
		});

		await bento.set({
			key: this.getCacheKey(BirthdayIdentifier.fromStrings(birthdayRecord.guildId, birthdayRecord.userId)),
			value: birthdayRecord,
			ttl: 60 * 60 // Cache for 1 hour
		});

		return this.toDomain(birthdayRecord);
	}

	public async update(payload: UpdateBirthdayDTO): Promise<Birthday> {
		const birthdayRecord = await prisma.birthday.update({
			where: {
				userId_guildId: {
					guildId: payload.guildId,
					userId: payload.userId
				}
			},
			data: {
				birthday: payload.birthday,
				disabled: payload.disabled ?? false
			}
		});

		if (!birthdayRecord) {
			throw new Error('Birthday not found');
		}

		await bento.set({
			key: this.getCacheKey(BirthdayIdentifier.fromStrings(birthdayRecord.guildId, birthdayRecord.userId)),
			value: birthdayRecord,
			ttl: 60 * 60 // Cache for 1 hour
		});

		return this.toDomain(birthdayRecord);
	}

	public async delete(guildId: string, userId: string): Promise<Birthday | null> {
		const birthdayRecord = await prisma.birthday
			.delete({
				where: {
					userId_guildId: {
						guildId,
						userId
					}
				}
			})
			.catch(() => null);

		if (!birthdayRecord) {
			return null;
		}

		await bento.delete({
			key: this.getCacheKey(BirthdayIdentifier.fromStrings(birthdayRecord.guildId, birthdayRecord.userId))
		});

		return this.toDomain(birthdayRecord);
	}

	private getCacheKey(id: BirthdayIdentifier): string {
		return `birthday:${id.guildId.toString()}:${id.userId.toString()}`;
	}

	private toDomain(birthdayRecord: PrismaBirthday): Birthday {
		return Birthday.create({
			id: BirthdayIdentifier.fromStrings(birthdayRecord.guildId, birthdayRecord.userId),
			birthday: birthdayRecord.birthday,
			disabled: birthdayRecord.disabled,
			createdAt: birthdayRecord.createdAt,
			updatedAt: birthdayRecord.updatedAt
		});
	}
}
