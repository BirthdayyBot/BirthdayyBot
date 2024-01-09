import '#lib/setup/start';

import { BirthdayyClient } from '#lib/BirthdayyClient';
import { rootFolder } from '#lib/utils/constants';
import { container } from '@sapphire/pieces';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';

const client = new BirthdayyClient();

async function main() {
	// Load in Sentry for error logging
	if (process.env.SENTRY_URL) {
		Sentry.init({
			dsn: process.env.SENTRY_URL,
			integrations: [
				new Sentry.Integrations.Modules(),
				new Sentry.Integrations.FunctionToString(),
				new Sentry.Integrations.LinkedErrors(),
				new Sentry.Integrations.Console(),
				new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
				new RewriteFrames({ root: rootFolder }),
			],
		});
	}

	try {
		// Connect to the Database
		await container.prisma.$connect();

		// Login to the Discord gateway
		await client.login();
	} catch (error) {
		container.logger.error(error);
		await client.destroy();
		process.exit(1);
	}
}

main().catch(container.logger.error.bind(container.logger));
