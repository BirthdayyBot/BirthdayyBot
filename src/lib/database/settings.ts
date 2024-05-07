import type { Guild } from '@prisma/client';
import { container } from '@sapphire/framework';
import { Collection } from 'discord.js';

const settingsCache = new Collection<string, Guild>();

export async function fetchSettings(guildId: string): Promise<Guild> {
	const cached = settingsCache.get(guildId);
	if (cached) return cached;

	let guild = await container.prisma.guild.findUnique({ where: { guildId } });
	if (!guild) guild = await container.prisma.guild.create({ data: { guildId } });

	settingsCache.set(guildId, guild);
	return guild;
}

export async function updateSettings(guildId: string, data: Partial<Omit<Guild, 'guildId'>>): Promise<Guild> {
	const guild = await container.prisma.guild.upsert({
		where: { guildId },
		update: data,
		create: { ...data, guildId }
	});

	settingsCache.set(guildId, guild);
	return guild;
}

export async function deleteSettings(guildId: string): Promise<Guild | null> {
	settingsCache.delete(guildId);
	return container.prisma.guild.delete({ where: { guildId } }).catch(() => null);
}

export async function resetSettings(guildId: string, ...settings: (keyof Guild)[]): Promise<Guild> {
	const guild = await updateSettings(guildId, Object.fromEntries(settings.map((key) => [key, null])));

	settingsCache.set(guildId, guild);
	return guild;
}
