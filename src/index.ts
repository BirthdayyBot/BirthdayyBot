import '#lib/setup/start';

import { container } from '@sapphire/pieces';
import * as Sentry from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { BirthdayyClient } from '#lib/BirthdayyClient.js';
import { SENTRY_OPTIONS } from '#root/config';

const client = new BirthdayyClient();

async function main() {
	try {
		if (envIsDefined('SENTRY_DSN')) Sentry.init(SENTRY_OPTIONS);
		await container.prisma.$connect();
		await client.login();
	} catch (error) {
		container.logger.error(error);
		await container.prisma.$disconnect();
		client.destroy();
		process.exit(1);
	}
}

main().catch((error) => {
	container.logger.error(error);
});
