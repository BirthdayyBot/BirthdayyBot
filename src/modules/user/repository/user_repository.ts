import { bento } from '#root/modules/core/services/cache';
import { prisma } from '#root/modules/core/services/prisma.js';
import type { User as PrismaUser } from '@prisma/client';
import { User } from '../domain/user.js';
import { UserIdentifier } from '../domain/user_identifier.js';

interface StoreUserDTO {
	id: string;
	username: string | null;
	discriminator: string | null;
	premium: boolean;
}
interface UpdateUserDTO {
	id: string;
	username?: string | null;
	discriminator?: string | null;
	premium?: boolean;
}

export class UserRepository {
	public async findById(id: UserIdentifier): Promise<User | null> {
		const userRecord = await bento.getOrSet({
			key: this.getCacheKey(id),
			factory: () => {
				return prisma.user.findUnique({
					where: { id: id.toString() }
				});
			},
			ttl: 60 * 60 // Cache for 1 hour
		});

		if (!userRecord) {
			return null;
		}

		return this.toDomain(userRecord);
	}

	public async create(dto: StoreUserDTO): Promise<User> {
		const userRecord = await prisma.user.create({
			data: {
				id: dto.id,
				username: dto.username,
				discriminator: dto.discriminator,
				premium: dto.premium
			}
		});

		await bento.set({
			key: this.getCacheKey(UserIdentifier.fromString(userRecord.id)),
			value: userRecord,
			ttl: 60 * 60
		});

		return this.toDomain(userRecord);
	}

	public async update(dto: UpdateUserDTO): Promise<User | null> {
		try {
			const userRecord = await prisma.user.update({
				where: { id: dto.id },
				data: {
					username: dto.username,
					discriminator: dto.discriminator,
					premium: dto.premium
				}
			});

			await bento.set({
				key: this.getCacheKey(UserIdentifier.fromString(userRecord.id)),
				value: userRecord,
				ttl: 60 * 60
			});

			return this.toDomain(userRecord);
		} catch (error) {
			return null;
		}
	}

	public async delete(id: UserIdentifier): Promise<User | null> {
		const userRecord = await prisma.user
			.delete({
				where: { id: id.toString() }
			})
			.catch(() => null);

		if (!userRecord) {
			return null;
		}

		await bento.delete({ key: this.getCacheKey(id) });

		return this.toDomain(userRecord);
	}

	private getCacheKey(id: UserIdentifier): string {
		return `user:${id.toString()}`;
	}

	private toDomain(userRecord: PrismaUser): User {
		return User.create({
			id: UserIdentifier.fromString(userRecord.id),
			username: userRecord.username,
			discriminator: userRecord.discriminator,
			premium: userRecord.premium,
			createdAt: userRecord.createdAt,
			updatedAt: userRecord.updatedAt
		});
	}
}
