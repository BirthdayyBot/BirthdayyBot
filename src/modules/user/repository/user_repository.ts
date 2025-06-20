import { BaseRepository } from '#core/repository/base_repository';
import { prisma } from '#core/services/prisma';
import { User } from '#user/domain/user';
import { UserIdentifier } from '#user/domain/user_identifier';
import type { User as PrismaUser } from '@prisma/client';

export class UserRepository extends BaseRepository<UserIdentifier, User, PrismaUser> {
	public constructor() {
		super('UserRepository', 'multitier');
	}

	public override toDomain(entity: PrismaUser): User {
		return User.create({
			id: UserIdentifier.fromString(entity.id),
			username: entity.username,
			discriminator: entity.discriminator,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			premium: entity.premium
		});
	}

	protected createInSource(key: UserIdentifier, entity: Omit<User['props'], 'id'>): Promise<PrismaUser> {
		return prisma.user.create({
			data: {
				id: key.toString(),
				...entity
			}
		});
	}

	protected findFromSource(key: UserIdentifier): Promise<PrismaUser | null> {
		return prisma.user.findUnique({
			where: { id: key.toString() }
		});
	}

	protected updateInSource(key: UserIdentifier, entity: Partial<Omit<User['props'], 'id'>>): Promise<PrismaUser> {
		return prisma.user.update({
			where: { id: key.toString() },
			data: entity
		});
	}

	protected deleteFromSource(key: UserIdentifier): Promise<PrismaUser | null> {
		return prisma.user.delete({
			where: { id: key.toString() }
		});
	}
}
