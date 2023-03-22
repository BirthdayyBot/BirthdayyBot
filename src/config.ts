import { Time } from '@sapphire/time-utilities';
import { container, LogLevel } from '@sapphire/framework';
import type { ServerOptions } from '@sapphire/plugin-api';
import type { InternationalizationOptions } from '@sapphire/plugin-i18next';
import { type ClientOptions, GatewayIntentBits } from 'discord.js';
import { UserIDEnum } from './lib/enum/UserID.enum';
import {
	API_EXTENSION,
	API_PORT,
	APP_ENV,
	DEBUG,
	ROOT_DIR,
	SENTRY_DSN,
	TOKEN_DISCORDBOTLIST,
	TOKEN_DISCORDLIST,
	TOKEN_TOPGG,
} from './helpers/provide/environment';
import { getGuildLanguage } from './helpers/provide/config';
import type { BotList } from '@devtomio/plugin-botlist';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import type { ScheduledTasksOptions } from '@sapphire/plugin-scheduled-tasks';
import type { QueueOptions } from 'bullmq';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';

function parseApi(): ServerOptions {
	return {
		prefix: API_EXTENSION,
		origin: '*',
		listenOptions: { port: API_PORT },
		automaticallyConnect: false,
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

function parseScheduledTasksOptions(): ScheduledTasksOptions {
	return {
		strategy: new ScheduledTaskRedisStrategy({
			bull: parseBullOptions(),
		}),
	};
}

function parseBullOptions(): QueueOptions {
	return {
		connection: {
			port: 32768,
			password: 'redispw',
			host: 'localhost',
			db: 0,
			username: 'default',
		},
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

import '@sapphire/plugin-utilities-store/register';

export const CLIENT_OPTIONS: ClientOptions = {
	api: parseApi(),
	botList: parseBotListOptions(),
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultPrefix: 'b!',
	i18n: parseInternationalizationOptions(),
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	loadMessageCommandListeners: true,
	loadDefaultErrorListeners: true,
	logger: {
		level: DEBUG ? LogLevel.Debug : LogLevel.Info,
	},
	tasks: parseScheduledTasksOptions(),
};
