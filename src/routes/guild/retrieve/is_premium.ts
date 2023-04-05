import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest } from '../../../lib/api/types';
import { authenticated } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/is-premium' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { guildId } = request.query;

		const results = await container.utilities.guild.get.GuildPremium(guildId);

		container.logger.info('results', results);

		if (!results) return response.badRequest({ error: 'Guild not Found' });

		return response.ok(results.premium);
	}
}
