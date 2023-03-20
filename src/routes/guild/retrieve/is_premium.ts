import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { parseBoolean } from '../../../helpers/utils/utils';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { selectGuildPremium, whereGuild } from '../../../lib/db';

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/is-premium' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.GET](request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { guild_id } = request.query;

		const results = await container.prisma.guild.findUnique({
			...whereGuild(guild_id),
			...selectGuildPremium,
		});

		container.logger.info('results', results);

		if (!results) return response.badRequest({ error: 'Guild not Found' });

		const is_premium = parseBoolean(`${results.premium}`);
		return response.ok(is_premium);
	}
}
