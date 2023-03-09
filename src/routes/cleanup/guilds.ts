import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ApiVerification } from '../../helpers/provide/api_verification';

/**
 * @description Disable Guilds & assosicated that are not present in the discord cache
 */
export class CleanUpGuildsRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			name: 'cleanup/guilds',
			route: 'cleanup/guilds'
		});
	}

	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		if (!(await ApiVerification(request))) {
			return response.status(401).json({ error: 'Unauthorized' });
		}
		const [db_guilds] = await container.sequelize.query(
			`SELECT guild_id FROM guild
			WHERE  disabled = false`
		);
		const cleanedGuilds = await this.processGuilds(db_guilds);
		return response.status(200).json({ db_guilds, cleaned_guilds: cleanedGuilds.length, cleanedGuilds });
	}

	public async processGuilds(guilds: any[]) {
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
			if (error.message === 'Unknown Guild') {
				return false;
			} else {
				container.logger.info('error', error.message);
			}
		}
		return true;
	}

	public async cleanGuild(guild_id: string): Promise<{ guild_id: string; guild_disabled: number; birthdays_disabled: number }> {
		container.logger.info('guild does not exist', guild_id);
		//disable guild
		const [_disableguild, disableGuildMeta]: [any, any] = await container.sequelize.query(
			`UPDATE guild SET disabled = true WHERE guild_id = '${guild_id}'`,
			{
				type: 'UPDATE'
			}
		);
		//disable birthdays with guild_id
		const [_disablebirthdays, disablebirthdaysMeta]: [any, any] = await container.sequelize.query(
			`UPDATE birthday SET disabled = true WHERE guild_id = '${guild_id}'`,
			{
				type: 'UPDATE'
			}
		);

		return {
			guild_id: `${guild_id}`,
			guild_disabled: disableGuildMeta,
			birthdays_disabled: disablebirthdaysMeta
		};
	}
}
