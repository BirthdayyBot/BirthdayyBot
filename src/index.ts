import './lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';

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
	typing: true,
	hmr: {
		enabled: process.env.NODE_ENV === 'development'
	},
	api: {
		// The prefix for all routes, e.g. / or v1/
		prefix: 'api/',
		// The origin header to be set on every request at 'Access-Control-Allow-Origin.
		origin: '*',
		listenOptions: {
			port: 4000,
		}
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
