import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { PrismaClient } from '@prisma/client';
import { SapphireClient, container } from '@sapphire/framework';
import { envIsDefined, envParseNumber, envParseString } from '@skyra/env-utilities';
import { WebhookClient } from 'discord.js';

export class BirthdayyClient extends SapphireClient {
	public constructor() {
		super(CLIENT_OPTIONS);
		this.initailizeDB_URL();

		container.prisma = new PrismaClient();
		container.webhook = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;
	}

	private initailizeDB_URL() {
		if (!envIsDefined('DB_URL'))
			process.env.DB_URL = `mysql://${envParseString('DB_USERNAME')}:${envParseString('DB_PASSWORD')}@
		${envParseString('DB_HOST')}:${envParseNumber('DB_PORT')}/${envParseString('DB_NAME')}?sslaccept=strict`;
	}
}
