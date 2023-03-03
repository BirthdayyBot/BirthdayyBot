import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { parseBoolean } from '../../../helpers/utils/utils';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			route: 'guild/retrieve/is-premium'
		});
	}

	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { query } = request;
		const { guild_id } = query;

		if (!guild_id) {
			response.statusCode = 400;
			response.statusMessage = 'Missing Parameter - guild_id';
			return response.json({ error: 'Missing Parameter - guild_id' });
		}

		const [results] = await container.sequelize.query(`SELECT guild_id, premium FROM guild g WHERE guild_id = ? AND disabled = false`, {
            replacements: [guild_id]
		});
        console.log("results", results);

		if (results.length === 0) {
			response.statusMessage = 'Guild not found';
			return response.status(404).json({ error: 'Guild not Found' });
		}

		const is_premium: boolean = parseBoolean(`${(results[0] as any).premium}`);
		response.status(200).json(is_premium);
	}
}
