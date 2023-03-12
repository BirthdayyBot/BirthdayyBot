import './lib/setup';
import { BirthdayyBot } from './lib/BirthdayyBot';
import getGuildCount from './helpers/provide/guildCount';
import { container } from '@sapphire/framework';

const client = new BirthdayyBot();

const main = async () => {
    try {
        await container.db.authenticate().then(() => {
            container.logger.info('Connection has been established successfully.');
        }).catch((error) => {
            container.logger.fatal(error);
        });

        container.logger.info('Logging in');
        container.logger.info(`APP_ENV: ${process.env.APP_ENV}`);
        container.logger.info(`BOTNAME: ${process.env.BOT_NAME}`);
        await client.login().then(() => {
            container.logger.info('Logged in');

        });
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

