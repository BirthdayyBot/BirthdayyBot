import './lib/setup/start';

import { container } from '@sapphire/pieces';
import * as Sentry from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { SENTRY_OPTIONS } from './config';
import { BirthdayyClient } from './lib/BirthdayyClient';

const client = new BirthdayyClient();

if (envIsDefined('SENTRY_DSN')) Sentry.init(SENTRY_OPTIONS);

try {
	await container.prisma.$connect();
	// Login to the Discord gateway
	await client.login();
} catch (error) {
	container.errorLogger.handle(error, { logSeverity: 'error' });
	await container.prisma.$disconnect();
	await client.destroy();
	process.exit(1);
}
