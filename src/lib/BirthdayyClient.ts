import { PrismaClient } from '@prisma/client';
import { container, SapphireClient } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { envIsDefined, envParseNumber, envParseString } from '@skyra/env-utilities';
import { WebhookClient } from 'discord.js';
import { join } from 'node:path';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '../config';
import { ErrorLogger } from './utils/ErrorLogger';
import { WebhookAdminNotificationStrategy } from './utils/strategies/WebhookAdminNotificationStrategy';

export class BirthdayyClient extends SapphireClient {
	public constructor() {
		super(CLIENT_OPTIONS);
		this.initailizeDB_URL();
		this.registerPaths();

		container.prisma = new PrismaClient();
		container.errorLogger = new ErrorLogger({ enableSentry: envIsDefined('SENTRY_DSN') });

		// Setup admin notification strategy if webhook is available
		if (WEBHOOK_ERROR) {
			const webhook = new WebhookClient(WEBHOOK_ERROR);
			const webhookStrategy = new WebhookAdminNotificationStrategy(webhook);
			container.errorLogger.setAdminNotificationStrategy(webhookStrategy);
		}
	}

	private registerPaths() {
		this.stores.get('scheduled-tasks').registerPath(join(getRootData().root, 'tasks'));
	}

	private initailizeDB_URL() {
		if (!envIsDefined('DB_URL'))
			process.env.DB_URL = `mysql://${envParseString('DB_USERNAME')}:${envParseString('DB_PASSWORD')}@
		${envParseString('DB_HOST')}:${envParseNumber('DB_PORT')}/${envParseString('DB_NAME')}`;
	}
}
