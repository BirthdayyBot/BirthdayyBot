import { BirthdaysManager } from '#lib/structures/managers/BirthdaysManager';
import { SettingsManager } from '#lib/structures/managers/SettingsManager';
import { GuildIDEnum } from '#utils/constants';
import { isNotCustom, isDevelopment, isCustom } from '#utils/env';
import { MAIN_DISCORD } from '#utils/environment';
import { container } from '@sapphire/framework';
import type { Guild, GuildResolvable } from 'discord.js';
import { Guild as Settings } from '@prisma/client';

export async function getCommandGuilds(
	commandLevel: 'global' | 'testing' | 'premium' | 'admin',
): Promise<string[] | undefined> {
	const testingGuilds = [GuildIDEnum.ChilliHQ, GuildIDEnum.ChilliAttackV2, GuildIDEnum.BirthdayyTesting];
	const adminGuilds = [GuildIDEnum.Birthdayy, GuildIDEnum.BirthdayyTesting];
	const customGuild = [MAIN_DISCORD];
	if (isNotCustom) adminGuilds.push(GuildIDEnum.ChilliHQ);
	if (isDevelopment) return testingGuilds;
	switch (commandLevel) {
		case 'global':
			if (isCustom) return customGuild;
			return undefined;
		case 'testing':
			return testingGuilds;
		case 'premium': {
			if (isCustom) return customGuild;
			const guilds: Settings[] = await container.utilities.guild.get.PremiumGuilds();
			const guildIds: string[] = guilds.map((guild) => guild.guildId);
			return guildIds;
		}
		case 'admin':
			return adminGuilds;
		default:
			return undefined;
	}
}

interface GuildUtilities {
	readonly settings: SettingsManager;
	readonly birthdays: BirthdaysManager;
	readonly guild: Guild;
}

export const cache = new WeakMap<Guild, GuildUtilities>();

export function getGuildUtilities(resolvable: GuildResolvable): GuildUtilities {
	const guild = resolveGuild(resolvable);
	const previous = cache.get(guild);
	if (previous !== undefined) return previous;

	const entry: GuildUtilities = {
		settings: new SettingsManager(guild),
		birthdays: new BirthdaysManager(guild),
		guild,
	};
	cache.set(guild, entry);

	return entry;
}

export const getSettings = getProperty('settings');
export const getBirthdays = getProperty('birthdays');
export const getGuild = getProperty('guild');

function getProperty<K extends keyof GuildUtilities>(property: K) {
	return (resolvable: GuildResolvable): GuildUtilities[K] => getGuildUtilities(resolvable)[property];
}

function resolveGuild(resolvable: GuildResolvable): Guild {
	const guild = container.client.guilds.resolve(resolvable);
	if (guild === null) throw new TypeError(`${resolvable} resolved to null.`);

	return guild;
}
