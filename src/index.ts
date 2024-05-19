import '#lib/setup';

import { BirthdayyClient } from '#lib/BirthdayyClient';
import { rootFolder } from '#utils/constants';
import { container } from '@sapphire/pieces';
import * as Sentry from '@sentry/node';
import { envIsDefined, envParseString } from '@skyra/env-utilities';

const client = new BirthdayyClient();

async function main() {
	// Load in Sentry for error logging
	if (envIsDefined('SENTRY_URL')) {
		Sentry.init({
			dsn: envParseString('SENTRY_URL'),
			integrations: [
				Sentry.consoleIntegration(),
				Sentry.functionToStringIntegration(),
				Sentry.linkedErrorsIntegration(),
				Sentry.modulesIntegration(),
				Sentry.onUncaughtExceptionIntegration(),
				Sentry.onUnhandledRejectionIntegration(),
				Sentry.httpIntegration({ breadcrumbs: true }),
				// TODO: Enable for NeonDB
				// Sentry.postgresIntegration(),
				Sentry.rewriteFramesIntegration({ root: rootFolder })
			]
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
