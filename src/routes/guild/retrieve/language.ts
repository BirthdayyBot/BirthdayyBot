import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import type { GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/language' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const { guild_id } = _request.query;

		const [results] = await container.sequelize.query('SELECT guild_id, language FROM guild g WHERE guild_id = ? AND disabled = false', {
			replacements: [guild_id],
		});

		return response.ok(results[0]);
	}
}
