import { BirthdaysManager } from '#lib/structures/managers/BirthdaysManager';
import { SettingsManager } from '#lib/structures/managers/SettingsManager';
import { container } from '@sapphire/pieces';
import { Guild, GuildResolvable } from 'discord.js';

interface GuildUtilities {
	readonly birthdays: BirthdaysManager;
	readonly guild: Guild;
	readonly settings: SettingsManager;
}

const cache = new WeakMap<Guild, GuildUtilities>();

export function getGuildUtilities(resolvable: GuildResolvable): GuildUtilities {
	const guild = resolveGuild(resolvable);
	const previous = cache.get(guild);
	if (previous !== undefined) return previous;

	const settings = new SettingsManager(guild);
	const birthdays = new BirthdaysManager(guild, settings);

	const entry: GuildUtilities = { birthdays, guild, settings };

	cache.set(guild, entry);

	return entry;
}

export const getGuild = getProperty('guild');
export const getSettings = getProperty('settings');
export const getBirthdays = getProperty('birthdays');

function getProperty<K extends keyof GuildUtilities>(property: K) {
	return (resolvable: GuildResolvable): GuildUtilities[K] => getGuildUtilities(resolvable)[property];
}

function resolveGuild(resolvable: GuildResolvable): Guild {
	const guild = container.client.guilds.resolve(resolvable);
	if (guild === null) throw new TypeError(`${resolvable} resolved to null.`);

	return guild;
}
