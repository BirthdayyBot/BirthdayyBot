import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			route: 'guild/config/retrieve/languageByGuild'
		});
	}

	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const { query } = _request;
		const { guild_id } = query;

		if (!guild_id) {
			response.statusCode = 400;
			response.statusMessage = 'Missing Parameter - guild_id';
			return response.json({ error: 'Missing Parameter - guild_id' });
		}

		const [results] = await container.sequelize.query(`SELECT guild_id, language FROM guild g WHERE guild_id = ? AND disabled = false`, {
			replacements: [guild_id]
		});
		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.json(results);
	}
}
