import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/is_disabled' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.GET](request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { guildId } = request.query;

		const results = await container.utilities.guild.get.GuildDisabled(guildId);

		return response.ok({ is_disabled: results?.disabled });
	}
}
