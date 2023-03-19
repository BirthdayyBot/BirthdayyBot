import './lib/setup/start';

import { BirthdayyClient } from './lib/BirthdayyClient';
import { container } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { SENTRY_OPTIONS } from './config';
import { SENTRY_DSN } from './helpers/provide/environment';

const client = new BirthdayyClient();

async function main() {
	try {
		// Initialize Sentry
		SENTRY_DSN ?? Sentry.init(SENTRY_OPTIONS);
		// Connect to the Database
		container.sequelize.authenticate();
		// Login to the Discord gateway
		await client.login();
	} catch (error) {
		container.logger.error(error);
		container.sequelize.close();
		client.destroy();
		process.exit(1);
	}
}

main().catch(container.logger.error.bind(container.logger));