import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			name: 'cleanup/guilds',
			route: 'cleanup/guilds'
		});
	}

	public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
		const { query } = _request;
		const { guild_id } = query;

		if (!guild_id) {
			response.statusCode = 400;
			response.statusMessage = 'Missing Parameter - guild_id';
			return response.json({ error: 'Missing Parameter - guild_id' });
		}

		const [results] = await container.sequelize.query(
			`    SELECT id, b.user_id, birthday, username, discriminator, b.guild_id
            FROM birthday b
                     LEFT JOIN user u ON b.user_id = u.user_id
            WHERE guild_id = ?
              AND b.disabled = false`,
			{
				replacements: [guild_id]
			}
		);

		if (results.length === 0) {
			response.statusCode = 404;
			response.statusMessage = 'Guild not found';
			return response.json({ error: 'Guild not Found' });
		}

		const birthdays = results as Array<any>;
		return response.status(200).json({ amount: birthdays.length, birthdays: results });
	}
}
