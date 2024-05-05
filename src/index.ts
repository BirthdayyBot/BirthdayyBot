import '#lib/setup';

import { BirthdayyClient } from '#lib/BirthdayyClient';
import { PRISMA_CLIENT_OPTIONS } from '#root/config';
import { rootFolder } from '#utils/constants';
import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/pieces';
import { rewriteFramesIntegration } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { envIsDefined, envParseString } from '@skyra/env-utilities';

const client = new BirthdayyClient();

async function main() {
	// Load in Sentry for error logging
	if (envIsDefined('SENTRY_URL')) {
		Sentry.init({
			dsn: envParseString('SENTRY_URL'),
			integrations: [
				new Sentry.Integrations.Modules(),
				new Sentry.Integrations.FunctionToString(),
				new Sentry.Integrations.LinkedErrors(),
				new Sentry.Integrations.Console(),
				new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
				rewriteFramesIntegration({ root: rootFolder })
			]
		});
	}

	try {
		container.prisma = new PrismaClient(PRISMA_CLIENT_OPTIONS);

		// Login to the Discord gateway
		await client.login();
	} catch (error) {
		container.logger.error(error);
		await client.destroy();
		process.exit(1);
	}
}

main().catch(container.logger.error.bind(container.logger));
