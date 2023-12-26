import { GuildMemberFetchQueue } from '#lib/discord';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { PrismaClient } from '@prisma/client';
import { Enumerable } from '@sapphire/decorators';
import { SapphireClient, container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { WebhookClient } from 'discord.js';

export class BirthdayyClient extends SapphireClient {
	@Enumerable(false)
	public override readonly guildMemberFetchQueue = new GuildMemberFetchQueue();

	public constructor() {
		super(CLIENT_OPTIONS);

		container.prisma = new PrismaClient({ datasourceUrl: envParseString('DATABASE_URL') });
		container.webhook = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;
	}
}
