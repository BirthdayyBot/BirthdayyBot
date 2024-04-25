import type { ServerOptions, ServerOptionsAuth } from '@sapphire/plugin-api';
import type { ScheduledTaskHandlerOptions } from '@sapphire/plugin-scheduled-tasks';
import type { FormatFunction, InterpolationOptions } from 'i18next';

import { transformOauthGuildsAndUser } from '#lib/api/utils';
import { minutes } from '#lib/utils/common/times';
import { TimezoneWithLocale } from '#lib/utils/common/timezone';
import { Emojis, LanguageFormatters, rootFolder } from '#utils/constants';
import { DEBUG } from '#utils/environment';
import { getGuild } from '#utils/functions/guilds';
import { ConnectionOptions } from '@influxdata/influxdb-client';
import { LogLevel, container } from '@sapphire/framework';
import { type InternationalizationOptions } from '@sapphire/plugin-i18next';
import { isNullOrUndefined } from '@sapphire/utilities';
import { Integrations, type NodeOptions } from '@sentry/node';
import { envIsDefined, envParseArray, envParseBoolean, envParseInteger, envParseNumber, envParseString } from '@skyra/env-utilities';
import { ActivityType, GatewayIntentBits, Locale, type OAuth2Scopes, PermissionFlagsBits } from 'discord-api-types/v10';
import {
	ActivitiesOptions,
	type ClientOptions,
	Options,
	Partials,
	type PermissionsString,
	type WebhookClientData,
	channelMention,
	roleMention
} from 'discord.js';
import { join } from 'node:path';

export const OWNERS = envParseArray('CLIENT_OWNERS');

export function parseAnalytics(): ConnectionOptions {
	const url = envParseString('INFLUX_URL');
	const token = envParseString('INFLUX_TOKEN');

	return {
		token,
		url
	};
}

function parseApiAuth(): ServerOptionsAuth | undefined {
	if (!process.env.OAUTH_SECRET) return undefined;

	return {
		cookie: envParseString('OAUTH_COOKIE'),
		domainOverwrite: envParseString('OAUTH_DOMAIN_OVERWRITE'),
		id: envParseString('CLIENT_ID'),
		redirect: envParseString('OAUTH_REDIRECT_URI'),
		scopes: envParseArray('OAUTH_SCOPE') as OAuth2Scopes[],
		secret: envParseString('OAUTH_SECRET'),
		transformers: [transformOauthGuildsAndUser]
	};
}

function parseApi(): ServerOptions | undefined {
	if (!envParseBoolean('API_ENABLED', false)) return undefined;

	return {
		auth: parseApiAuth(),
		automaticallyConnect: false,
		listenOptions: { port: envParseInteger('API_PORT') },
		origin: envParseString('API_ORIGIN'),
		prefix: envParseString('API_PREFIX', '/')
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
		ARROW: Emojis.Arrow,
		CLIENT_ID: process.env.CLIENT_ID,
		REDCROSS: Emojis.RedCross,
		LOADIND: Emojis.Sign,
		GREENTICK: Emojis.GreenTick,
		VERSION: process.env.CLIENT_VERSION,
		...parseInternationalizationDefaultVariablesPermissions()
	};
}

function parseInternationalizationInterpolation(): InterpolationOptions {
	return {
		defaultVariables: parseInternationalizationDefaultVariables(),
		escapeValue: false,
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
		}
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
			defaultNS: 'globals',
			fallbackLng: 'en-US',
			initImmediate: false,
			interpolation: parseInternationalizationInterpolation(),
			lng: 'en-US',
			load: 'all',
			preload: languages,
			returnEmptyString: false,
			returnNull: false,
			returnObjects: true,
			supportedLngs: languages
		})
	};
}

function parseBullOptions(): ScheduledTaskHandlerOptions['bull'] {
	const { REDIS_PASSWORD, REDIS_USERNAME } = process.env;

	return {
		connection: {
			db: envParseInteger('REDIS_DB'),
			host: envParseString('REDIS_HOST', 'localhost'),
			password: REDIS_PASSWORD,
			port: envParseNumber('REDIS_PORT', 6379),
			tls: envParseBoolean('REDIS_TLS', false) ? {} : undefined,
			username: REDIS_USERNAME
		}
	};
}

function parseScheduledTasksOptions(): ScheduledTaskHandlerOptions {
	return {
		bull: parseBullOptions(),
		queue: 'birthdayy'
	};
}

function parsePresenceActivity(): ActivitiesOptions[] {
	const { CLIENT_PRESENCE_NAME } = process.env;
	if (!CLIENT_PRESENCE_NAME) return [];

	return [
		{
			name: CLIENT_PRESENCE_NAME,
			type: ActivityType[envParseString('CLIENT_PRESENCE_TYPE', 'Playing') as keyof typeof ActivityType]
		}
	];
}

export const SENTRY_OPTIONS: NodeOptions = {
	debug: DEBUG,
	integrations: [new Integrations.Http({ breadcrumbs: true, tracing: true })]
};

export const CLIENT_OPTIONS: ClientOptions = {
	allowedMentions: { roles: [], users: [] },
	api: parseApi(),
	i18n: parseInternationalizationOptions(),
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
	loadDefaultErrorListeners: false,
	logger: {
		level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug
	},
	makeCache: Options.cacheEverything(),
	partials: [Partials.Channel],
	presence: { activities: parsePresenceActivity() },
	shards: 'auto',
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: minutes.toSeconds(3),
			lifetime: minutes.toSeconds(15)
		}
	},
	tasks: parseScheduledTasksOptions()
};

function parseWebhookError(): WebhookClientData | null {
	if (!envIsDefined('WEBHOOK_ERROR_ID', 'WEBHOOK_ERROR_TOKEN')) return null;

	return {
		id: envParseString('WEBHOOK_ERROR_ID'),
		token: envParseString('WEBHOOK_ERROR_TOKEN')
	};
}

export const WEBHOOK_ERROR = parseWebhookError();
