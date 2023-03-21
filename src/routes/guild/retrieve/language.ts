import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import type { GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/language' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const guildID = _request.query.guild_id as string;

		const results = await container.utilities.guild.get.GuildLanguage(guildID);

		return response.ok(results);
	}
}
