import './lib/setup/start';

import { container } from '@sapphire/pieces';
import * as Sentry from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { SENTRY_OPTIONS } from './config';
import { BirthdayyClient } from './lib/BirthdayyClient';

const client = new BirthdayyClient();

try {
	if (envIsDefined('SENTRY_DSN')) Sentry.init(SENTRY_OPTIONS);
	await container.prisma.$connect();
	await client.login();
} catch (error) {
	container.errorLogger.handle(error, { logSeverity: 'error' });
	await container.prisma.$disconnect();
	client.destroy();
	process.exit(1);
}
