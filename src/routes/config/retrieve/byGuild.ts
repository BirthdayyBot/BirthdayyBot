import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { selectGuildConfig, whereDisableGuild } from '../../../lib/db';
@ApplyOptions<Route.Options>({ route: 'config/retrieve/byGuild' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.GET](_request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { guild_id } = _request.query;

		const guild = await container.prisma.guild.findUnique({
			...whereDisableGuild(guild_id, false),
			...selectGuildConfig,
		});

		return response.ok({ ...guild });
	}
}
