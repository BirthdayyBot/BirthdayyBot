import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/enable' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.POST](request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { query } = request;
		const { guild_id } = query;

		const guild = await container.utilities.guild.update.DisableGuildAndBirthdays(guild_id, false);

		if (!guild) return response.badRequest({ error: 'Guild not found' });

		return response.ok({ message: `Guild ${guild_id} enabled`, guild });
	}
}
