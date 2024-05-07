import type { Birthday } from '@prisma/client';
import { container } from '@sapphire/framework';
import { Collection } from 'discord.js';

const birthdaysCache = new Collection<{ guildId: string; userId: string }, Birthday>();

export async function fetchBirthday(guildId: string, userId: string): Promise<Birthday | null> {
	const cached = birthdaysCache.get({ guildId, userId });
	if (cached) return cached;

	const birthday = await container.prisma.birthday.findFirst({ where: { guildId, userId } });
	if (!birthday) return null;

	birthdaysCache.set({ guildId, userId }, birthday);
	return birthday;
}

export async function fetchBirthdaysByGuilds(guildId: string): Promise<Birthday[]> {
	return container.prisma.birthday.findMany({ where: { guildId } });
}

export async function fetchBirthdaysByDate(date: string): Promise<Birthday[]> {
	return container.prisma.birthday.findMany({
		where: {
			birthday: {
				contains: date
			}
		}
	});
}

export async function fetchBirthdaysByGuildAndMonth(guildId: string, month: string): Promise<Birthday[]> {
	return container.prisma.birthday.findMany({
		where: {
			guildId,
			birthday: {
				contains: `-${month}-`
			}
		}
	});
}

export async function fetchBirthdaysByGuildAndDate(guildId: string, date: string): Promise<Birthday[]> {
	return container.prisma.birthday.findMany({
		where: {
			guildId,
			birthday: {
				contains: date
			}
		}
	});
}

export async function createBirthday(userId: string, guildId: string, birthday: string): Promise<Birthday> {
	const data = await container.prisma.birthday.create({
		data: { birthday, userId, guildId }
	});

	birthdaysCache.set({ guildId, userId }, data);
	return data;
}

export async function updateBirthday(
	userId: string,
	guildId: string,
	data: Omit<Birthday, 'userId' | 'guildId'>
): Promise<Birthday> {
	const birthday = await container.prisma.birthday.upsert({
		where: { userId_guildId: { guildId, userId } },
		update: data,
		create: {
			...data,
			guild: {
				connectOrCreate: {
					where: { guildId },
					create: { guildId }
				}
			},
			user: {
				connectOrCreate: {
					where: { userId },
					create: { userId }
				}
			}
		}
	});

	birthdaysCache.set({ guildId, userId }, birthday);
	return birthday;
}

export async function deleteBirthday(userId: string, guildId: string): Promise<Birthday | null> {
	birthdaysCache.delete({ guildId, userId });
	return container.prisma.birthday.delete({ where: { userId_guildId: { guildId, userId } } }).catch(() => null);
}

export async function deleteBirthdaysByGuild(guildId: string): Promise<void> {
	birthdaysCache.sweep((value) => value.guildId === guildId);
	await container.prisma.birthday.deleteMany({ where: { guildId } });
}
