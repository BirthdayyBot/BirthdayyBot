import { BirthdaysManager } from '#lib/structures/managers/BirthdaysManager';
import { SettingsManager } from '#lib/structures/managers/SettingsManager';
import { GuildIDEnum } from '#utils/constants';
import { isCustom, isDevelopment, isNotCustom } from '#utils/env';
import { container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import type { Guild, GuildResolvable } from 'discord.js';

export async function getCommandGuilds(
	commandLevel: 'global' | 'testing' | 'premium' | 'admin'
): Promise<string[] | undefined> {
	const testingGuilds = [GuildIDEnum.ChilliHQ, GuildIDEnum.ChilliAttackV2, GuildIDEnum.BirthdayyTesting];
	const adminGuilds = [GuildIDEnum.Birthdayy, GuildIDEnum.BirthdayyTesting];
	const customGuild = [envParseString('CLIENT_MAIN_GUILD')];
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
			const guilds = await container.prisma.guild.findMany({
				where: { premium: true },
				select: { guildId: true }
			});

			return guilds.map((guild) => guild.guildId);
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

	const settings = new SettingsManager(guild);
	const entry: GuildUtilities = {
		settings,
		birthdays: new BirthdaysManager(guild, settings),
		guild
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
