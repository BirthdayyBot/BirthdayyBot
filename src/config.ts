import { transformOauthGuildsAndUser } from '#lib/api/utils';
import { minutes } from '#lib/utils/common/times';
import { getHandler } from '#root/languages/index';
import { Emojis, LanguageFormatters, rootFolder } from '#utils/constants';
import { DEBUG } from '#utils/environment';
import { ConnectionOptions } from '@influxdata/influxdb-client';
import { LogLevel, container } from '@sapphire/framework';
import type { ServerOptions, ServerOptionsAuth } from '@sapphire/plugin-api';
import { I18nextFormatter, i18next, type InternationalizationOptions } from '@sapphire/plugin-i18next';
import type { ScheduledTaskHandlerOptions } from '@sapphire/plugin-scheduled-tasks';
import { Integrations, type NodeOptions } from '@sentry/node';
import {
	envIsDefined,
	envParseArray,
	envParseBoolean,
	envParseInteger,
	envParseNumber,
	envParseString,
} from '@skyra/env-utilities';
import {
	ActivityType,
	GatewayIntentBits,
	PermissionFlagsBits,
	PresenceUpdateStatus,
	type OAuth2Scopes,
} from 'discord-api-types/v10';
import {
	LocaleString,
	Options,
	TimestampStyles,
	time,
	type ClientOptions,
	type PermissionsString,
	type PresenceData,
	type WebhookClientData,
} from 'discord.js';
import type { InterpolationOptions } from 'i18next';
import { join } from 'node:path';

export const OWNERS = envParseArray('CLIENT_OWNERS');

function parseApiAuth(): ServerOptionsAuth | undefined {
	if (!process.env.OAUTH_SECRET) return undefined;

	return {
		id: envParseString('CLIENT_ID'),
		secret: envParseString('OAUTH_SECRET'),
		cookie: envParseString('OAUTH_COOKIE', 'BIRTHDAYY_AUTH'),
		redirect: envParseString('OAUTH_REDIRECT_URI', 'http://127.0.0.1:3000/oauth/callback'),
		scopes: envParseArray('OAUTH_SCOPE') as OAuth2Scopes[],
		transformers: [transformOauthGuildsAndUser],
		domainOverwrite: envParseString('OAUTH_DOMAIN_OVERWRITE', '127.0.0.1'),
	};
}

function parseApi(): ServerOptions | undefined {
	if (!envParseBoolean('API_ENABLED', false)) return undefined;

	return {
		auth: parseApiAuth(),
		prefix: envParseString('API_PREFIX', '/'),
		origin: envParseString('API_ORIGIN', 'http://127.0.0.1:3000'),
		listenOptions: { port: envParseInteger('API_PORT', 3000) },
		automaticallyConnect: false,
	};
}

export const PROJECT_ROOT = join(rootFolder, process.env.OVERRIDE_ROOT_PATH ?? 'src');
export const LANGUAGE_ROOT = join(PROJECT_ROOT, 'languages');

function parseInternationalizationDefaultVariablesPermissions() {
	const keys = Object.keys(PermissionFlagsBits) as readonly PermissionsString[];
	const entries = keys.map((key) => [key, key] as const);

	return Object.fromEntries(entries) as Readonly<Record<PermissionsString, PermissionsString>>;
}

type EmojisString = keyof typeof Emojis;
function parseInternationalizationDefaultVariablesEmojis() {
	const keys = Object.keys(Emojis) as readonly EmojisString[];
	const entries = keys.map((key) => [key, key] as const);

	return Object.fromEntries(entries) as Readonly<Record<EmojisString, EmojisString>>;
}

function parseInternationalizationDefaultVariables() {
	return {
		VERSION: process.env.CLIENT_VERSION,
		SUCCESS: Emojis.Success,
		FAIL: Emojis.Fail,
		PLUS: Emojis.Plus,
		HEART: Emojis.Heart,
		DEFAULT_PREFIX: process.env.CLIENT_PREFIX,
		CLIENT_ID: process.env.CLIENT_ID,
		...parseInternationalizationDefaultVariablesPermissions(),
		...parseInternationalizationDefaultVariablesEmojis,
	};
}

function parseInternationalizationInterpolation(): InterpolationOptions {
	return { escapeValue: false, defaultVariables: parseInternationalizationDefaultVariables() };
}

function parseInternationalizationFormatters(): I18nextFormatter[] {
	const { t } = i18next;

	return [
		// Add custom formatters:
		{
			name: LanguageFormatters.Number,
			format: (lng, options) => {
				const formatter = new Intl.NumberFormat(lng, { maximumFractionDigits: 2, ...options });
				return (value) => formatter.format(value);
			},
			cached: true,
		},
		{
			name: LanguageFormatters.NumberCompact,
			format: (lng, options) => {
				const formatter = new Intl.NumberFormat(lng, {
					notation: 'compact',
					compactDisplay: 'short',
					maximumFractionDigits: 2,
					...options,
				});
				return (value) => formatter.format(value);
			},
			cached: true,
		},
		{
			name: LanguageFormatters.Duration,
			format: (lng, options) => {
				const formatter = getHandler((lng ?? 'en-US') as LocaleString).duration;
				const precision = (options?.precision as number) ?? 2;
				return (value) => formatter.format(value, precision);
			},
			cached: true,
		},
		{
			name: LanguageFormatters.HumanDateTime,
			format: (lng, options) => {
				const formatter = new Intl.DateTimeFormat(lng, {
					timeZone: 'Etc/UTC',
					dateStyle: 'short',
					timeStyle: 'medium',
					...options,
				});
				return (value) => formatter.format(value);
			},
			cached: true,
		},
		// Add Discord markdown formatters:
		{ name: LanguageFormatters.DateTime, format: (value) => time(new Date(value), TimestampStyles.ShortDateTime) },
		// Add alias formatters:
		{
			name: LanguageFormatters.Permissions,
			format: (value, lng, options) => t(`permissions:${value}`, { lng, ...options }) as string,
		},
	];
}

function parseInternationalizationOptions(): InternationalizationOptions {
	return {
		defaultMissingKey: 'default',
		defaultNS: 'globals',
		defaultLanguageDirectory: LANGUAGE_ROOT,
		fetchLanguage: async ({ guild }) => {
			if (!guild) return 'en-US';
			const settings = await container.prisma.guild.findFirst({ where: { guildId: guild.id } });
			return settings?.language ?? 'en-US';
		},
		formatters: parseInternationalizationFormatters(),
		i18next: (_: string[], languages: string[]) => ({
			supportedLngs: languages,
			preload: languages,
			returnObjects: true,
			returnEmptyString: false,
			returnNull: false,
			load: 'all',
			lng: 'en-US',
			fallbackLng: {
				default: ['en-US'],
			},
			defaultNS: 'globals',
			overloadTranslationOptionHandler: (args) => ({ defaultValue: args[1] ?? 'globals:default' }),
			initImmediate: false,
			interpolation: parseInternationalizationInterpolation(),
		}),
	};
}

function parseBullOptions(): ScheduledTaskHandlerOptions['bull'] {
	const { REDIS_USERNAME, REDIS_PASSWORD } = process.env;

	return {
		connection: {
			port: envParseNumber('REDIS_PORT', 6379),
			password: REDIS_PASSWORD,
			host: envParseString('REDIS_HOST', 'localhost'),
			db: envParseInteger('REDIS_DB'),
			username: REDIS_USERNAME,
		},
	};
}

function parseScheduledTasksOptions(): ScheduledTaskHandlerOptions {
	return {
		queue: 'birthdayy',
		bull: parseBullOptions(),
	};
}

function parsePresenceOptions(): PresenceData {
	return {
		status: PresenceUpdateStatus.Online,
		activities: [
			{
				name: '/birthday set 🎂',
				type: ActivityType.Watching,
			},
		],
	};
}

export const SENTRY_OPTIONS: NodeOptions = {
	debug: DEBUG,
	integrations: [new Integrations.Http({ breadcrumbs: true, tracing: true })],
};

export function parseAnalytics(): ConnectionOptions {
	const url = envParseString('INFLUX_URL');
	const token = envParseString('INFLUX_TOKEN');

	return {
		url,
		token,
	};
}

export const CLIENT_OPTIONS: ClientOptions = {
	allowedMentions: { users: [], roles: [] },
	api: parseApi(),
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
	loadDefaultErrorListeners: false,
	logger: {
		level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug,
	},
	shards: 'auto',
	makeCache: Options.cacheEverything(),
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: minutes.toSeconds(3),
			lifetime: minutes.toSeconds(15),
		},
	},
	i18n: parseInternationalizationOptions(),
	tasks: parseScheduledTasksOptions(),
	presence: parsePresenceOptions(),
};

function parseWebhookError(): WebhookClientData | null {
	if (!envIsDefined('WEBHOOK_ERROR_ID', 'WEBHOOK_ERROR_TOKEN')) return null;

	return {
		id: envParseString('WEBHOOK_ERROR_ID'),
		token: envParseString('WEBHOOK_ERROR_TOKEN'),
	};
}

export const WEBHOOK_ERROR = parseWebhookError();
