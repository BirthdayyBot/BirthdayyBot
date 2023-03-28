import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest, GuildAndUserQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/entryByUserAndGuild' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildAndUserQuery>()
	public async [methods.GET](_request: ApiRequest<GuildAndUserQuery>, response: ApiResponse) {
		const { guild_id, user_id } = _request.query;

		const results = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);

		return response.ok(results);
	}
}
