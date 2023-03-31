import type { BotList } from '@devtomio/plugin-botlist';
import { ClientLoggerOptions, container, LogLevel } from '@sapphire/framework';
import type { ServerOptions } from '@sapphire/plugin-api';
import type { InternationalizationOptions } from '@sapphire/plugin-i18next';
import type { ScheduledTasksOptions } from '@sapphire/plugin-scheduled-tasks';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import { Time } from '@sapphire/time-utilities';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import type { QueueOptions } from 'bullmq';
import { ActivityType, GatewayIntentBits, PresenceData, PresenceUpdateStatus, WebhookClientData, type ClientOptions } from 'discord.js';
import { getGuildLanguage } from './helpers/provide/config';
import {
	API_EXTENSION,
	API_PORT,
	APP_ENV,
	DEBUG,
	REDIS_DB,
	REDIS_HOST,
	REDIS_PASSWORD,
	REDIS_PORT,
	REDIS_USERNAME,
	ROOT_DIR,
	SENTRY_DSN,
	TOKEN_DISCORDBOTLIST,
	TOKEN_DISCORDLIST,
	TOKEN_TOPGG,
	WEBHOOK_ID,
	WEBHOOK_TOKEN,
} from './helpers/provide/environment';
import { UserIDEnum } from './lib/enum/UserID.enum';

function parseApi(): ServerOptions {
	return {
		prefix: API_EXTENSION,
		origin: '*',
		listenOptions: { port: API_PORT },
		automaticallyConnect: false,
	};
}

function parseBotListOptions(): BotList.Options {
	return {
		clientId: UserIDEnum.BIRTHDAYY,
		debug: DEBUG,
		shard: true,
		autoPost: {
			enabled: APP_ENV === 'prd',
			interval: 3 * Time.Hour,
		},
		keys: {
			topGG: TOKEN_TOPGG,
			discordListGG: TOKEN_DISCORDLIST,
			discordBotList: TOKEN_DISCORDBOTLIST,
		},
	};
}

function parseInternationalizationOptions(): InternationalizationOptions {
	return {
		defaultMissingKey: 'generic:key_not_found',
		fetchLanguage: async (context) => {
			if (!context.guild) {
				return 'en-US';
			}

			const guildLanguage: string = await getGuildLanguage(context.guild.id);
			container.logger.info(guildLanguage);
			return guildLanguage || 'en-US';
		},
	};
}

function parseBullOptions(): QueueOptions {
	return {
		connection: {
			port: REDIS_PORT,
			password: REDIS_PASSWORD,
			host: REDIS_HOST,
			db: REDIS_DB,
			username: REDIS_USERNAME,
		},
	};
}

function parseScheduledTasksOptions(): ScheduledTasksOptions {
	return {
		strategy: new ScheduledTaskRedisStrategy({
			bull: parseBullOptions(),
		}),
	};
}

function parsePresenceOptions(): PresenceData {
	return {
		status: PresenceUpdateStatus.Online,
		activities: [
			{
				name: '/birthday register 🎂',
				type: ActivityType.Watching,
			},
		],
	};
}

function parseLoggerOptions(): ClientLoggerOptions {
	return {
		level: DEBUG ? LogLevel.Debug : LogLevel.Info,
		instance: container.logger,
	};
}

export const SENTRY_OPTIONS: Sentry.NodeOptions = {
	dsn: SENTRY_DSN,
	debug: DEBUG,
	integrations: [
		new Sentry.Integrations.Modules(),
		new Sentry.Integrations.FunctionToString(),
		new Sentry.Integrations.LinkedErrors(),
		new Sentry.Integrations.Console(),
		new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
		new RewriteFrames({ root: ROOT_DIR }),
	],
};

export const CLIENT_OPTIONS: ClientOptions = {
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	loadDefaultErrorListeners: true,
	logger: parseLoggerOptions(),
	shards: 'auto',
	api: parseApi(),
	botList: parseBotListOptions(),
	i18n: parseInternationalizationOptions(),
	tasks: parseScheduledTasksOptions(),
	presence: parsePresenceOptions(),
};

function parseWebhookError(): WebhookClientData | null {
	if (!WEBHOOK_TOKEN || !WEBHOOK_ID) return null;

	return {
		id: WEBHOOK_ID,
		token: WEBHOOK_TOKEN,

	};
}

export const WEBHOOK_ERROR = parseWebhookError();
