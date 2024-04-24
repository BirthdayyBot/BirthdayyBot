import type { Guild, GuildResolvable } from 'discord.js';

import { BirthdaysManager } from '#lib/structures/managers/BirthdaysManager';
import { SettingsManager } from '#lib/structures/managers/SettingsManager';
import { GuildIDEnum } from '#utils/constants';
import { isCustom, isDevelopment } from '#utils/env';
import { Guild as Settings } from '@prisma/client';
import { container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';

export async function getCommandGuilds(commandLevel: 'admin' | 'global' | 'premium' | 'testing'): Promise<string[] | undefined> {
	const testingGuilds = [GuildIDEnum.ChilliHQ, GuildIDEnum.ChilliAttackV2, GuildIDEnum.BirthdayyTesting];
	const adminGuilds = [GuildIDEnum.Birthdayy, GuildIDEnum.BirthdayyTesting];
	const customGuild = [envParseString('CLIENT_MAIN_GUILD')];
	if (!isCustom) adminGuilds.push(GuildIDEnum.ChilliHQ);
	if (isDevelopment) return testingGuilds;
	switch (commandLevel) {
		case 'global':
			if (isCustom) return customGuild;
			return undefined;
		case 'testing':
			return testingGuilds;
		case 'premium': {
			if (isCustom) return customGuild;
			const guilds: Settings[] = await container.prisma.guild.findMany({ where: { premium: true } });
			const guildIds: string[] = guilds.map((guild) => guild.id);
			return guildIds;
		}
		case 'admin':
			return adminGuilds;
		default:
			return undefined;
	}
}

interface GuildUtilities {
	readonly birthdays: BirthdaysManager;
	readonly guild: Guild;
	readonly settings: SettingsManager;
}

export const cache = new WeakMap<Guild, GuildUtilities>();

export function getGuildUtilities(resolvable: GuildResolvable): GuildUtilities {
	const guild = resolveGuild(resolvable);
	const previous = cache.get(guild);
	if (previous !== undefined) return previous;

	const settings = new SettingsManager(guild);
	const entry: GuildUtilities = {
		birthdays: new BirthdaysManager(guild, settings),
		guild,
		settings
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
