import { GuildMemberFetchQueue } from '#lib/discord';
import { AnalyticsData } from '#lib/structures';
import { CLIENT_OPTIONS, WEBHOOK_ERROR, WEBHOOK_LOG } from '#root/config';
import { Enumerable } from '@sapphire/decorators';
import { SapphireClient, container } from '@sapphire/framework';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { envParseBoolean } from '@skyra/env-utilities';
import { WebhookClient } from 'discord.js';

export class BirthdayyClient extends SapphireClient {
	@Enumerable(false)
	public override dev = process.env.NODE_ENV !== 'production';

	/**
	 * The webhook to use for the error event
	 */
	@Enumerable(false)
	public override webhookError: WebhookClient | null = WEBHOOK_ERROR ? new WebhookClient(WEBHOOK_ERROR) : null;

	/**
	 * The webhook to use for the logs event
	 */
	@Enumerable(false)
	public override webhookLog: WebhookClient | null = WEBHOOK_LOG ? new WebhookClient(WEBHOOK_LOG) : null;

	@Enumerable(false)
	public override readonly analytics: AnalyticsData | null = envParseBoolean('INFLUX_ENABLED')
		? new AnalyticsData()
		: null;

	@Enumerable(false)
	public override readonly guildMemberFetchQueue = new GuildMemberFetchQueue();

	public constructor() {
		super(CLIENT_OPTIONS);
	}

	public override async login(token?: string) {
		const loginResponse = await super.login(token);
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
		const guild = await container.prisma.guild.findUnique({ where: { id: message.guild?.id } });
		return guild ? guild.language : 'en-US';
	};

	public override async computeGuilds() {
		if (this.shard) {
			const guilds = await this.shard.broadcastEval((c) => c.guilds.cache.filter((g) => g.available).size);

			return guilds.reduce((acc, g) => acc + g, 0);
		}

		return this.guilds.cache.size;
	}

	public override async computeUsers() {
		if (this.shard) {
			const users = await this.shard.broadcastEval((c) =>
				c.guilds.cache.filter((g) => g.available).reduce((acc, guild) => acc + (guild.memberCount ?? 0), 0)
			);

			return users.reduce((acc, m) => acc + m, 0);
		}

		return this.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount ?? 0), 0);
	}
}
