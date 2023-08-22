import './lib/setup/start';

import { container } from '@sapphire/pieces';
import * as Sentry from '@sentry/node';
import { SENTRY_OPTIONS } from './config';
import { BirthdayyClient } from './lib/BirthdayyClient';
import { envIsDefined } from '@skyra/env-utilities';

const client = new BirthdayyClient();

async function main() {
	try {
		if (envIsDefined('SENTRY_DSN')) Sentry.init(SENTRY_OPTIONS);
		await container.prisma.$connect();
		await client.login();
	} catch (error) {
		container.logger.error(error);
		await container.prisma.$disconnect();
		await client.destroy();
		process.exit(1);
	}
}

main().catch((error) => {
	container.logger.error(error);
});
