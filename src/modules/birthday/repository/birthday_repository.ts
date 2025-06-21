import { Birthday } from '#birthday/domain/birthday';
import { BirthdayIdentifier } from '#birthday/domain/birthday_identifier';
import { BaseRepository } from '#core/repository/base_repository';
import { prisma } from '#core/services/prisma';
import type { Birthday as PrismaBirthday } from '@prisma/client';

export class BirthdayRepository extends BaseRepository<BirthdayIdentifier, Birthday, PrismaBirthday> {
	public override toDomain(entity: PrismaBirthday): Birthday {
		return Birthday.create({
			id: BirthdayIdentifier.fromStrings(entity.userId, entity.guildId),
			birthday: entity.birthday,
			disabled: entity.disabled,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt
		});
	}

	protected createInSource(key: BirthdayIdentifier, entity: Omit<Birthday['props'], 'id'>): Promise<PrismaBirthday> {
		return prisma.birthday.create({
			data: {
				userId: key.userId,
				guildId: key.guildId,
				birthday: entity.birthday,
				disabled: entity.disabled
			}
		});
	}

	protected findFromSource(key: BirthdayIdentifier): Promise<PrismaBirthday | null> {
		return prisma.birthday.findUnique({
			where: {
				userId_guildId: {
					userId: key.userId,
					guildId: key.guildId
				}
			}
		});
	}

	protected updateInSource(
		key: BirthdayIdentifier,
		entity: Partial<Omit<Birthday['props'], 'id'>>
	): Promise<PrismaBirthday> {
		return prisma.birthday.update({
			where: {
				userId_guildId: {
					userId: key.userId,
					guildId: key.guildId
				}
			},
			data: entity
		});
	}

	protected deleteFromSource(key: BirthdayIdentifier): Promise<PrismaBirthday | null> {
		return prisma.birthday.delete({
			where: {
				userId_guildId: {
					userId: key.userId,
					guildId: key.guildId
				}
			}
		});
	}
}
