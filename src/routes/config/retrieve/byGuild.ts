import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import type { GuildConfigRawModel } from '../../../lib/model';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			route: 'config/retrieve/byGuild'
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

		const [results] = await container.sequelize.query(
			`
        SELECT guild_id,
            announcement_channel,
            announcement_message,
            overview_channel,
            birthday_role,
            birthday_ping_role,
            overview_message,
            log_channel,
            timezone,
            language,
            premium
        FROM guild WHERE guild_id = ? AND disabled = 0`,
			{
				replacements: [guild_id]
			}
		);
		if (results.length === 0) {
			return response.status(404).json({ error: 'Guild not Found' });
		}
		const config: GuildConfigRawModel = results[0] as GuildConfigRawModel;
		return response.status(200).json({ config: config });
	}
}
