import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { authenticated } from '../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { selectGuild, selectGuildAndBirthdays, updateGuildInAndBirthdays, whereGuildsIn } from '../../lib/db';

@ApplyOptions<Route.Options>({ route: 'cleanup/test' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
		const enableGuild = await container.prisma.guild.findMany({
			where: {
				disabled: false,
			},
			...selectGuild,
		});

		const cleanedGuilds = await this.processGuilds(enableGuild);
		return response.ok({ enableGuild, cleaned_guilds: cleanedGuilds.length, cleanedGuilds });
	}

	public async processGuilds(guilds: selectGuild[]) {
		const results = [];

		for (const guild of guilds) {
			if (await this.isValidGuild(guild.guild_id)) continue;
			const result = await this.cleanGuild(guild.guild_id);
			results.push(result);
		}

		return results;
	}

	public async isValidGuild(guild_id: string) {
		try {
			const guildExists = await container.client.guilds.fetch(guild_id);
			container.logger.info('guild exists', guildExists.id);
		} catch (error: any) {
			if (error.message === 'Unknown Guild') return false;
			else container.logger.info('error', error.message);
		}
		return true;
	}

	public async cleanGuild(guild_id: string) {
		container.logger.info('guild does not exist', guild_id);

		const disableGuildMeta = await container.prisma.guild.update({
			...whereGuildsIn(guild_id),
			...updateGuildInAndBirthdays(guild_id, true),
			...selectGuildAndBirthdays,
		});

		return {
			guild_id: `${guild_id}`,
			guild_disabled: disableGuildMeta,
			birthdays_disabled: disableGuildMeta.birthday,
		};
	}
}
