import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/entriesByGuild' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.GET](_request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { guildId } = _request.query;

		const results = await container.utilities.birthday.get.BirthdaysNotDisabled(guildId);

		if (!results) return response.badRequest({ error: 'Guild not Found' });

		return response.ok({ amount: results.length, birthdays: results });
	}
}
