import './lib/setup/start';
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import { getGuildLanguage } from './helpers/provide/config';
import getGuildCount from './helpers/provide/guildCount';

container.client = new SapphireClient({
	defaultPrefix: 'b!',
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	partials: [Partials.Channel, Partials.GuildMember],
	loadMessageCommandListeners: true,
	hmr: {
		enabled: process.env.NODE_ENV === 'development'
	},
	api: {
		prefix: 'api/',
		origin: '*',
		listenOptions: {
			port: 4000
		}
	},
	i18n: {
		fetchLanguage: async (context) => {
			if (!context.guild) {
				return 'en-US';
			}

			const guildLanguage: string = await getGuildLanguage(context.guild.id);
			console.log(guildLanguage);
			return guildLanguage || 'en-US';
		},
		defaultMissingKey: 'generic:key_not_found'
	}
});

const main = async () => {
	try {
		container.logger.info('Logging in');
		await container.client.login();
		container.logger.info('logged in');
		container.logger.info(`Bot is in ${getGuildCount()} guilds`);
	} catch (error) {
		container.logger.fatal(error);
		container.client.destroy();
		process.exit(1);
	}
};

main();
import './lib/setup/planetscale';
