import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildAndUserQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/entryByUserAndGuild' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildAndUserQuery>()
	public async [methods.GET](_request: ApiRequest<GuildAndUserQuery>, response: ApiResponse) {
		const { guild_id, user_id } = _request.query;

		const [results] = await container.sequelize.query(
			`SELECT id, u.user_id AS user_id, birthday, username, discriminator, guild_id AS guild_id
            FROM birthday b
                     INNER JOIN user u ON b.user_id = u.user_id
            WHERE b.guild_id = ?
              AND b.user_id = ?
              AND b.disabled = false`,
			{
				replacements: [guild_id, user_id],
			},
		);

		return response.ok(results);
	}
}
