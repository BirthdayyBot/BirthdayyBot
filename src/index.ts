import './lib/setup/start';

import { container } from '@sapphire/pieces';
import * as Sentry from '@sentry/node';
import { SENTRY_OPTIONS } from './config';
import { BirthdayyClient } from './lib/BirthdayyClient';
import { envIsDefined } from '@skyra/env-utilities';

const client = new BirthdayyClient();

if (envIsDefined('SENTRY_DSN')) Sentry.init(SENTRY_OPTIONS);

try {
	await container.prisma.$connect();
	// Login to the Discord gateway
	await client.login();
} catch (error) {
	await container.prisma.$disconnect();
	container.logger.error(error);
	await client.destroy();
	process.exit(1);
}
