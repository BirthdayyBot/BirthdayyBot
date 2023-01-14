import './lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import '@sapphire/plugin-hmr/register';

const client = new SapphireClient({
	defaultPrefix: 'b!',
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	regexPrefix: /^(hey +)?bot[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	partials: [Partials.Channel],
	loadMessageCommandListeners: true,
	hmr: {
		enabled: process.env.NODE_ENV === 'development'
	}
});

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();
