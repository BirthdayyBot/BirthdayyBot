import './lib/setup';
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';

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
	}
});

const main = async () => {
	try {
		container.logger.info('Logging in');
		await container.client.login();
		container.logger.info('logged in');
	} catch (error) {
		container.logger.fatal(error);
		container.client.destroy();
		process.exit(1);
	}
};

main();
import './lib/setup/planetscale';
