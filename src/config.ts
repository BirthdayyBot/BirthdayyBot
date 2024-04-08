import { transformOauthGuildsAndUser } from '#lib/api/utils';
import { minutes } from '#lib/utils/common/times';
import { TimezoneWithLocale } from '#lib/utils/common/timezone';
import { Emojis, LanguageFormatters, rootFolder } from '#utils/constants';
import { DEBUG } from '#utils/environment';
import { getGuild } from '#utils/functions/guilds';
import { ConnectionOptions } from '@influxdata/influxdb-client';
import { LogLevel, container } from '@sapphire/framework';
import type { ServerOptions, ServerOptionsAuth } from '@sapphire/plugin-api';
import { type InternationalizationOptions } from '@sapphire/plugin-i18next';
import type { ScheduledTaskHandlerOptions } from '@sapphire/plugin-scheduled-tasks';
import { isNullOrUndefined } from '@sapphire/utilities';
import { Integrations, type NodeOptions } from '@sentry/node';
import {
	envIsDefined,
	envParseArray,
	envParseBoolean,
	envParseInteger,
	envParseNumber,
	envParseString,
} from '@skyra/env-utilities';
import { ActivityType, GatewayIntentBits, Locale, PermissionFlagsBits, type OAuth2Scopes } from 'discord-api-types/v10';
import {
	ActivitiesOptions,
	Options,
	Partials,
	channelMention,
	roleMention,
	type ClientOptions,
	type PermissionsString,
	type WebhookClientData,
} from 'discord.js';
import type { FormatFunction, InterpolationOptions } from 'i18next';
import { join } from 'node:path';

export const OWNERS = envParseArray('CLIENT_OWNERS');

export function parseAnalytics(): ConnectionOptions {
	const url = envParseString('INFLUX_URL');
	const token = envParseString('INFLUX_TOKEN');

	return {
		url,
		token,
	};
}

function parseApiAuth(): ServerOptionsAuth | undefined {
	if (!process.env.OAUTH_SECRET) return undefined;

	return {
		id: envParseString('CLIENT_ID'),
		secret: envParseString('OAUTH_SECRET'),
		cookie: envParseString('OAUTH_COOKIE'),
		redirect: envParseString('OAUTH_REDIRECT_URI'),
		scopes: envParseArray('OAUTH_SCOPE') as OAuth2Scopes[],
		transformers: [transformOauthGuildsAndUser],
		domainOverwrite: envParseString('OAUTH_DOMAIN_OVERWRITE'),
	};
}

function parseApi(): ServerOptions | undefined {
	if (!envParseBoolean('API_ENABLED', false)) return undefined;

	return {
		auth: parseApiAuth(),
		prefix: envParseString('API_PREFIX', '/'),
		origin: envParseString('API_ORIGIN'),
		listenOptions: { port: envParseInteger('API_PORT') },
		automaticallyConnect: false,
	};
}

export const PROJECT_ROOT = join(rootFolder, process.env.OVERRIDE_ROOT_PATH ?? 'dist');
export const LANGUAGE_ROOT = join(PROJECT_ROOT, 'languages');

function parseInternationalizationDefaultVariablesPermissions() {
	const keys = Object.keys(PermissionFlagsBits) as readonly PermissionsString[];
	const entries = keys.map((key) => [key, key] as const);

	return Object.fromEntries(entries) as Readonly<Record<PermissionsString, PermissionsString>>;
}

function parseInternationalizationDefaultVariables() {
	return {
		VERSION: process.env.CLIENT_VERSION,
		ARROW: Emojis.Arrow,
		SUCCESS: Emojis.Success,
		FAIL: Emojis.Fail,
		LOADIND: Emojis.Sign,
		CLIENT_ID: process.env.CLIENT_ID,
		...parseInternationalizationDefaultVariablesPermissions(),
	};
}

function parseInternationalizationInterpolation(): InterpolationOptions {
	return {
		escapeValue: false,
		defaultVariables: parseInternationalizationDefaultVariables(),
		format: (...[value, format, language, options]: Parameters<FormatFunction>) => {
			const t = container.i18n.getT(language ?? 'en-US');
			const defaultValue = t('globals:none', options);
			if (isNullOrUndefined(value)) return defaultValue;
			switch (format as LanguageFormatters) {
				case LanguageFormatters.Channel:
					return channelMention(value) as string;
				case LanguageFormatters.Role:
					return roleMention(value) as string;
				case LanguageFormatters.Language:
					return t(`languages:${language}`, options);
				case LanguageFormatters.Timezone:
					return TimezoneWithLocale[value as Locale];
				case LanguageFormatters.Number:
					return Intl.NumberFormat(language).format(value as number);
				default:
					return value as string;
			}
		},
	};
}

function parseInternationalizationOptions(): InternationalizationOptions {
	return {
		defaultLanguageDirectory: LANGUAGE_ROOT,
		fetchLanguage: ({ guild }) => {
			if (!guild) return 'en-US';

			return getGuild(guild).preferredLocale ?? 'en-US';
		},
		i18next: (_: string[], languages: string[]) => ({
			supportedLngs: languages,
			preload: languages,
			returnObjects: true,
			returnEmptyString: false,
			returnNull: false,
			load: 'all',
			lng: 'en-US',
			fallbackLng: 'en-US',
			defaultNS: 'globals',
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
			tls: envParseBoolean('REDIS_TLS', false) ? {} : undefined,
		},
	};
}

function parseScheduledTasksOptions(): ScheduledTaskHandlerOptions {
	return {
		queue: 'birthdayy',
		bull: parseBullOptions(),
	};
}

function parsePresenceActivity(): ActivitiesOptions[] {
	const { CLIENT_PRESENCE_NAME } = process.env;
	if (!CLIENT_PRESENCE_NAME) return [];

	return [
		{
			name: CLIENT_PRESENCE_NAME,
			type: ActivityType[envParseString('CLIENT_PRESENCE_TYPE', 'Listening') as keyof typeof ActivityType],
		},
	];
}

export const SENTRY_OPTIONS: NodeOptions = {
	debug: DEBUG,
	integrations: [new Integrations.Http({ breadcrumbs: true, tracing: true })],
};

export const CLIENT_OPTIONS: ClientOptions = {
	allowedMentions: { users: [], roles: [] },
	api: parseApi(),
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
	loadDefaultErrorListeners: false,
	makeCache: Options.cacheEverything(),
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: minutes.toSeconds(3),
			lifetime: minutes.toSeconds(15),
		},
	},
	partials: [Partials.Channel],
	presence: { activities: parsePresenceActivity() },
	logger: {
		level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug,
	},
	i18n: parseInternationalizationOptions(),
	tasks: parseScheduledTasksOptions(),
};

function parseWebhookError(): WebhookClientData | null {
	if (!envIsDefined('WEBHOOK_ERROR_ID', 'WEBHOOK_ERROR_TOKEN')) return null;

	return {
		id: envParseString('WEBHOOK_ERROR_ID'),
		token: envParseString('WEBHOOK_ERROR_TOKEN'),
	};
}

export const WEBHOOK_ERROR = parseWebhookError();
