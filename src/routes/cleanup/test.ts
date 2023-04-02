import { container } from '@sapphire/pieces';
import { type ApiRequest, type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { authenticated } from '../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from '@prisma/client';

@ApplyOptions<Route.Options>({ route: 'cleanup/test' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
		const enableGuild = await container.utilities.guild.get.GuildsEnableds();

		const cleanedGuilds = await this.processGuilds(enableGuild);
		return response.ok({ enableGuild, countCleanedGuilds: cleanedGuilds.length, cleanedGuilds });
	}

	public async processGuilds(guilds: Guild[]) {
		const results = [];

		for (const guild of guilds) {
			if (await this.isValidGuild(guild.guildId)) continue;
			const result = await this.cleanGuild(guild.guildId);
			results.push(result);
		}

		return results;
	}

	public async isValidGuild(guild_id: string) {
		try {
			const guildExists = await container.client.guilds.fetch(guild_id);
			container.logger.info('guild exists', guildExists.id);
		} catch (error: any) {
			if (error instanceof Error) {
				if (error.message === 'Unknown Guild') return false;
				container.logger.info('error', error.message);
			}
			container.logger.info('error', error);
		}
		return true;
	}

	public async cleanGuild(guild_id: string) {
		container.logger.info('guild does not exist', guild_id);

		const disableGuildMeta = await container.utilities.guild.update.DisableGuildAndBirthdays(guild_id, true);

		return {
			guild_id: `${guild_id}`,
			guild_disabled: disableGuildMeta,
			birthdays_disabled: disableGuildMeta.birthday,
		};
	}
}
