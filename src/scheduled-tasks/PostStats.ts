import { Events } from '#lib/types/Enums';
import { isProduction } from '#utils/env';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchResultTypes, QueryError, fetch } from '@sapphire/fetch';
import { MimeTypes } from '@sapphire/plugin-api';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { blueBright, green, red } from 'colorette';
import { Status } from 'discord.js';

const header = blueBright('[POST STATS]');

enum Lists {
	DiscordBotList = 'discordbotlist.com',
	TopGG = 'top.gg',
	DiscordListGG = 'discordlist.gg',
}

@ApplyOptions<ScheduledTask.Options>({
	name: 'PostStats',
	enabled: isProduction,
	pattern: '*/10 * * * *',
})
export class PostStats extends ScheduledTask {
	public async run() {
		const { client, logger } = this.container;

		// If the websocket isn't ready, delay the execution by 30 seconds:
		if (client.ws.status !== Status.Ready) {
			return;
		}

		const rawGuilds = client.guilds.cache.size;
		const rawUsers = client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0);

		this.processAnalytics(rawGuilds, rawUsers);
		if (this.container.client.dev) return;

		const guilds = rawGuilds.toString();
		const users = rawUsers.toString();
		const results = (
			await Promise.all([
				this.query(
					`https://top.gg/api/bots/${process.env.CLIENT_ID}/stats`,
					`{"server_count":${guilds}}`,
					process.env.TOP_GG_TOKEN,
					Lists.TopGG,
				),
				this.query(
					`https://discordbotlist.com/api/v1/bots/${process.env.CLIENT_ID}/stats`,
					`{"guilds":${guilds},"users":${users}}`,
					process.env.DISCORD_BOT_LIST_TOKEN ? `Bot ${process.env.DISCORD_BOT_LIST_TOKEN}` : null,
					Lists.DiscordBotList,
				),
				this.query(
					`https://api.discordlist.gg/v1/bots/${process.env.CLIENT_ID}/stats`,
					`{"count":${guilds}}`,
					process.env.DISCORD_LIST_GG_TOKEN,
					Lists.DiscordListGG,
				),
			])
		).filter((value) => value !== null);

		if (results.length) logger.trace(`${header} [ ${guilds} [G] ] [ ${users} [U] ] | ${results.join(' | ')}`);
		return null;
	}

	public async query(url: string, body: string, token: string | null, list: Lists) {
		try {
			if (!token) return null;
			await fetch(
				url,
				{
					body,
					headers: { 'content-type': MimeTypes.ApplicationJson, authorization: token },
					method: 'POST',
				},
				FetchResultTypes.Result,
			);
			return green(list);
		} catch (error) {
			const message = String(
				error instanceof Error ? (error instanceof QueryError ? error.code : error.message) : error,
			);
			return `${red(list)} [${red(message)}]`;
		}
	}

	private processAnalytics(guilds: number, users: number) {
		this.container.client.emit(Events.AnalyticsSync, guilds, users);
	}
}
