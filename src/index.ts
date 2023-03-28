import './lib/setup/start';

import { BirthdayyClient } from './lib/BirthdayyClient';
import { container } from '@sapphire/pieces';
import * as Sentry from '@sentry/node';
import { SENTRY_OPTIONS } from './config';
import { SENTRY_DSN } from './helpers/provide/environment';

const client = new BirthdayyClient();

async function main() {
	try {
		// Initialize Sentry
		if (SENTRY_DSN) Sentry.init(SENTRY_OPTIONS);
		// Connect to the Database
		container.prisma.$connect();
		// Login to the Discord gateway
		await client.login();
	} catch (error) {
		container.logger.error(error);
		container.prisma.$disconnect();
		client.destroy();
		process.exit(1);
	}
}

main().catch(container.logger.error.bind(container.logger));