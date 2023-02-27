import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ApiVerification } from '../../../helpers/provide/api_verification';
import type { GuildConfigRawModel } from '../../../lib/model';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			name: 'guild/leave',
			route: 'guild/leave'
		});
	}
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const { query } = request;
		const { guild_id } = query;
		if (!(await ApiVerification(request))) {
			return response.status(401).json({ error: 'Unauthorized' });
		}
		if (!guild_id) {
			response.statusCode = 400;
			response.statusMessage = 'Missing Parameter - guild_id';
			return response.json({ error: 'Missing Parameter - guild_id' });
		}

		const result: any = await container.sequelize.query(`SELECT guild_id, premium FROM guild WHERE guild_id = ?`, {
			replacements: [guild_id],
			type: 'SELECT'
		});
		const selectGuild: GuildConfigRawModel = result[0];

		if (!selectGuild) {
			return response.status(404).json({ error: 'Guild not found' });
		}

		const [_disableGuild] = await container.sequelize.query(`UPDATE guild SET disabled = 1 WHERE guild_id = ?`, {
			replacements: [guild_id]
		});

		const [_disableBirthdays] = await container.sequelize.query(`UPDATE birthday SET disabled = 1 WHERE guild_id = ?`, {
			replacements: [guild_id]
		});

		response.status(200).json({ message: `Guild ${guild_id} left` });
	}
}
