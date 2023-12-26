import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { PrismaClient } from '@prisma/client';
import { SapphireClient, container } from '@sapphire/framework';
import { envIsDefined, envParseNumber, envParseString } from '@skyra/env-utilities';
import { WebhookClient } from 'discord.js';
import { GuildMemberFetchQueue } from '#lib/discord';
import { Enumerable } from '@sapphire/decorators';

export class BirthdayyClient extends SapphireClient {
	@Enumerable(false)
	public override readonly guildMemberFetchQueue = new GuildMemberFetchQueue();

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
