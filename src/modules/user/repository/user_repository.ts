import { BaseRepository } from '#core/repository/base_repository';
import { prisma } from '#core/services/prisma';
import { User } from '#user/domain/user';
import { UserIdentifier } from '#user/domain/user_identifier';
import type { User as PrismaUser } from '@prisma/client';

export class UserRepository extends BaseRepository<UserIdentifier, User, PrismaUser> {
	public constructor() {
		super('UserRepository', 'multitier');
	}

	public toDomain(entity: PrismaUser): User {
		return User.create({
			id: UserIdentifier.fromString(entity.id),
			username: entity.username,
			discriminator: entity.discriminator,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
			premium: entity.premium
		});
	}

	protected saveToDatabase(entity: User): Promise<PrismaUser> {
		const { identifier } = entity;
		const data = {
			username: entity.props.username,
			discriminator: entity.props.discriminator,
			premium: entity.props.premium
		};
		return prisma.user.upsert({
			where: { id: identifier.toString() },
			update: data,
			create: {
				id: identifier.toString(),
				...data
			}
		});
	}

	protected async removeFromDatabase(identifier: UserIdentifier): Promise<PrismaUser | null> {
		const user = await prisma.user
			.delete({
				where: { id: identifier.toString() }
			})
			.catch(() => null);
		return user;
	}

	protected findInDatabase(identifier: UserIdentifier): Promise<PrismaUser | null> {
		return prisma.user.findUnique({
			where: { id: identifier.toString() }
		});
	}
}
