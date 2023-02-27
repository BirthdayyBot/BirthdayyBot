import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			route: 'guild/enable'
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

		const [_updateGuild, updateGuildMeta] = await container.sequelize.query(`UPDATE guild SET disabled = 0 WHERE guild_id = ?`, {
			replacements: [guild_id]
		});
		const [_updateBirthday, updateBirthdayMeta] = await container.sequelize.query(`UPDATE birthday SET disabled = 0 WHERE guild_id = ?`, {
			replacements: [guild_id]
		});

		console.log('updateGuildMeta', updateGuildMeta);
		const affectedRowsCountGuild = (updateGuildMeta as any).affectedRows;
		const affectedRowsCountBirthday = (updateBirthdayMeta as any).affectedRows;
		return response.status(200);
		return response.status(200).json({ affectedRowsCountGuild, affectedRowsCountBirthday });
	}
}
