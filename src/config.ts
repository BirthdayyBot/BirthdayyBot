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
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_USERNAME,
    DEBUG,
    REDIS_DB,
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    REDIS_USERNAME,
    TOKEN_DISCORDBOTLIST,
    TOKEN_DISCORDLIST,
    TOKEN_TOPGG,
} from './helpers/provide/environment';
import { getGuildLanguage } from './helpers/provide/config';
import type { BotList } from '@devtomio/plugin-botlist';
import type { Options } from 'sequelize';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import type { ScheduledTasksOptions } from '@sapphire/plugin-scheduled-tasks';
import type { QueueOptions } from 'bullmq';

function parseApi(): ServerOptions {
    return {
        prefix: API_EXTENSION,
        origin: '*',
        listenOptions: { port: parseInt(API_PORT) },
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
            port: REDIS_PORT,
            password: REDIS_PASSWORD,
            host: REDIS_HOST,
            db: REDIS_DB,
            username: REDIS_USERNAME,
        },
    };
}

export const DB_OPTIONS: Options = {
    database: DB_NAME,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    host: DB_HOST,
    logging: false,
    dialect: 'mysql',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
};

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
