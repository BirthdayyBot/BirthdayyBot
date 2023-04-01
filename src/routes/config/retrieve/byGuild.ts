import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest } from '../../../lib/api/types';
import { authenticated } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'config/retrieve/byGuild' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const { guildId } = _request.query;

		const guild = await container.utilities.guild.get.GuildConfig(guildId);

		return response.ok({ ...guild });
	}
}
