import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildAndUserQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { selectBirthdayWithUser, whereBithdayWithUserAndGuild } from '../../../lib/db';

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/entryByUserAndGuild' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildAndUserQuery>()
	public async [methods.GET](_request: ApiRequest<GuildAndUserQuery>, response: ApiResponse) {
		const { guild_id, user_id } = _request.query;

		const results = await container.prisma.birthday.findUnique({
			...whereBithdayWithUserAndGuild(guild_id, user_id),
			...selectBirthdayWithUser,
		});

		return response.ok(results);
	}
}
