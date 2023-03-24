import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { parseBoolean } from '../../../helpers/utils/utils';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

type GuildRetrieveQuery = GuildQuery & {
	disable?: string;
};

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/is-available' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildRetrieveQuery>(['guild_id'])
	public async [methods.GET](request: ApiRequest<GuildRetrieveQuery>, response: ApiResponse) {
		const { query } = request;
		const guild_id = query.guild_id;
		const disable = parseBoolean(query.disable ? query.disable.toString() : 'false');

		const guild = await container.client.guilds.fetch({
			guild: guild_id,
			withCounts: false,
		});

		if (!guild) {
			if (disable) {
				const guildDisabled = await container.utilities.guild.update.DisableGuildAndBirthdays(guild_id, true);
				return response.badRequest({
					is_available: false,
					data: { guild_id, disabledGuild: guildDisabled },
				});
			}
			return response.badRequest({ is_available: false, data: { guild_id } });
		}

		return response.ok({ is_available: guild ? true : false, data: guild ? guild : null });
	}
}
