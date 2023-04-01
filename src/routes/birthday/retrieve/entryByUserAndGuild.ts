import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest } from '../../../lib/api/types';
import { authenticated } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/entryByUserAndGuild' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const { guildId, userId } = _request.query;

		const results = await container.utilities.birthday.get.BirthdayByUserAndGuild(guildId, userId);

		return response.ok(results);
	}
}
