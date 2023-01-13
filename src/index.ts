import { LogLevel, SapphireClient } from '@sapphire/framework';
// import '@sapphire/plugin-logger/register';
import { GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';

config();

const client = new SapphireClient({
	defaultPrefix: '!',
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	logger: {
		level: LogLevel.Debug
	},
	loadMessageCommandListeners: true
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
