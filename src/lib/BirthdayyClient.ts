import { GuildMemberFetchQueue } from '#lib/discord';
import { CLIENT_OPTIONS, WEBHOOK_ERROR } from '#root/config';
import { PrismaClient } from '@prisma/client';
import { Enumerable } from '@sapphire/decorators';
import { SapphireClient, container } from '@sapphire/framework';
import { InternationalizationContext } from '@sapphire/plugin-i18next';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';
import { WebhookClient } from 'discord.js';
import { AnalyticsData } from './structures/AnalyticsData.js';

export class BirthdayyClient extends SapphireClient {
	@Enumerable(false)
	public override dev = process.env.NODE_ENV !== 'production';

	/**
	 * The webhook to use for the error event
	 */
	@Enumerable(false)
	public override webhookError: WebhookClient | null = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;

	@Enumerable(false)
	public override readonly analytics: AnalyticsData | null;

	@Enumerable(false)
	public override readonly guildMemberFetchQueue = new GuildMemberFetchQueue();

	public constructor() {
		super(CLIENT_OPTIONS);

		this.analytics = envParseBoolean('INFLUX_ENABLED') ? new AnalyticsData() : null;
		container.prisma = new PrismaClient({ datasourceUrl: envParseString('DATABASE_URL') });
		this.webhookError = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;
	}

	public override async login(token?: string) {
		const loginResponse = await super.login(token);
		this.guildMemberFetchQueue.fetch();
		return loginResponse;
	}

	public override async destroy() {
		this.guildMemberFetchQueue.destroy();
		return super.destroy();
	}

	/**
	 * Retrieves the language key for the message.
	 * @param message The message that gives context.
	 */
	public fetchLanguage = async (message: InternationalizationContext) => {
		const guild = await container.prisma.guild.findUnique({ where: { guildId: message.guild?.id } });
		return guild ? guild.language : 'en-US';
	};
}
