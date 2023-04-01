import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
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
	@validateParams<GuildRetrieveQuery>(['guildId'])
	public async [methods.GET](request: ApiRequest<GuildRetrieveQuery>, response: ApiResponse) {
		const { guildId, disable } = request.query;
		const toDisable = parseBoolean(disable ? disable.toString() : 'false');

		const guild = await container.client.guilds.fetch({
			guild: guildId,
			withCounts: false,
		});

		if (!guild) {
			if (toDisable) {
				const disabledGuild = await container.utilities.guild.update.DisableGuildAndBirthdays(guildId, true);
				return response.badRequest({
					is_available: false,
					data: { guild, disabledGuild },
				});
			}
			return response.badRequest({ is_available: false, data: { guildId } });
		}

		return response.ok({ is_available: !!guild, data: guild ? guild : null });
	}
}
