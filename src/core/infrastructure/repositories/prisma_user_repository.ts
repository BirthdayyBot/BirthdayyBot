import type { User } from '#domain/entities/user/user';
import { type Repository } from '#domain/repositories/base_repository';
import type { UserRepository } from '#domain/repositories/user_repository';
import { PrismaClient, type User as PrismaUser } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
	private prisma: PrismaClient;

	public constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	public async countByPremiumStatus(isPremium: boolean): Promise<number> {
		return this.prisma.user.count({
			where: { premium: isPremium }
		});
	}

	public async deleteById(userId: string): Promise<void> {
		await this.prisma.user.delete({
			where: { id: userId }
		});
	}

	public async findById(id: string): Promise<User | null> {
		const user = await this.prisma.user.findUnique({
			where: { id }
		});

		return user ? this.toDomainEntity(user) : null;
	}

	public async findAll(): Promise<User[]> {
		const users = await this.prisma.user.findMany();
		return users.map((data) => this.toDomainEntity(data));
	}

	public async count(): Promise<number> {
		return this.prisma.user.count();
	}

	public async createMany(users: Repository.CreateManyData<User>): Promise<User[]> {
		const createdUsers = await this.prisma.user.createManyAndReturn({
			data: users.map((user) => ({
				id: user.id,
				username: user.username,
				discriminator: user.discriminator,
				premium: user.premium ?? false
			})),
			skipDuplicates: true // Skip duplicates based on unique constraints
		});

		return createdUsers.map((data) => this.toDomainEntity(data));
	}

	public async findPremiumUsers(): Promise<User[]> {
		const results = await this.prisma.user.findMany({
			where: { premium: true }
		});
		return results.map((data) => this.toDomainEntity(data));
	}

	public async updatePremiumStatus(userId: string, isPremium: boolean): Promise<User> {
		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: { premium: isPremium }
		});
		return this.toDomainEntity(updatedUser);
	}

	public async findOrCreate(userId: string, defaultData: Repository.CreateData<User>): Promise<User> {
		const newUser = await this.prisma.user.upsert({
			where: { id: userId },
			update: {},
			create: {
				id: userId,
				username: defaultData.username,
				discriminator: defaultData.discriminator,
				premium: defaultData.premium ?? false
			}
		});
		return this.toDomainEntity(newUser);
	}

	public async update(userId: string, data: Repository.UpdateData<User>): Promise<User> {
		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: {
				username: data.username,
				discriminator: data.discriminator,
				premium: data.premium
			}
		});
		return this.toDomainEntity(updatedUser);
	}

	private toDomainEntity(data: PrismaUser): User {
		return {
			id: data.id,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			username: data.username ?? undefined,
			discriminator: data.discriminator ?? undefined,
			premium: data.premium
		};
	}
}
