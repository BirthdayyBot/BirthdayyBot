import './lib/setup/start';
import getGuildCount from './helpers/provide/guildCount';
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import { getGuildLanguage } from './helpers/provide/config';
import { sendMessage } from './lib/discord/message';

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
		container.logger.info(`ENV: ${process.env.NODE_ENV}`);
		container.logger.info(`BOTNAME: ${process.env.BOT_NAME}`);
		await container.client.login();
		container.logger.info('logged in');
		container.logger.info(`Bot is in ${getGuildCount()} guilds`);
	} catch (error) {
		container.logger.fatal(error);
		container.client.destroy();
		process.exit(1);
	}
	await sendMessage('1077621363881300018', { content: 'online' });
};

main();
import './lib/setup/planetscale';
