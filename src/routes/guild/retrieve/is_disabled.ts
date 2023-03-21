import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/is_disabled' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.GET](request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { guild_id } = request.query;

		const [results] = await container.sequelize.query('SELECT guild_id FROM guild WHERE guild_id = ? AND disabled = 1', {
			replacements: [guild_id],
		});

		return response.ok({ is_disabled: results.length > 0 });
	}
}
