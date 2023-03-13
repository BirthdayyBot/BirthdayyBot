import { Time } from '@sapphire/time-utilities';
import { container, LogLevel } from '@sapphire/framework';
import type { ServerOptions } from '@sapphire/plugin-api';
import type { InternationalizationOptions } from '@sapphire/plugin-i18next';
import { type ClientOptions, GatewayIntentBits } from 'discord.js';
import { UserIDEnum } from './lib/enum/UserID.enum';
import { APP_ENV, DEBUG } from './helpers/provide/environment';
import { getGuildLanguage } from './helpers/provide/config';
import type { BotList } from '@devtomio/plugin-botlist';
import type { Options } from 'sequelize';
import { ScheduledTaskRedisStrategy } from '@sapphire/plugin-scheduled-tasks/register-redis';
import type { ScheduledTasksOptions } from '@sapphire/plugin-scheduled-tasks';
import type { QueueOptions } from 'bullmq';

function parseApi(): ServerOptions {
    return {
        prefix: process.env.API_EXTENSION,
        origin: '*',
        listenOptions: { port: parseInt(process.env.API_PORT) },
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
            topGG: process.env.TOPGG_TOKEN,
            discordListGG: process.env.DISCORDLIST_TOKEN,
            discordBotList: process.env.DISCORDBOTLIST_TOKEN,
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
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            host: process.env.REDIS_HOST,
            db: process.env.REDIS_DB,
        },
    };
}


export const BD_OPTIONS: Options = {
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
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
        level: process.env.APP_ENV === 'prd' ? LogLevel.Info : LogLevel.Debug,
    },
    tasks: parseScheduledTasksOptions(),
};
