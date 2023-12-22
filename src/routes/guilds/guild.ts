import { flattenGuild } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ApiRequest, ApiResponse, HttpCodes, Route, type RouteOptions, methods } from '@sapphire/plugin-api';
import { Routes } from 'discord-api-types/v10';

@ApplyOptions<RouteOptions>({ route: 'guilds/:guild' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(seconds(5), 2, true)
	public async [methods.GET](request: ApiRequest, response: ApiResponse) {
		const guildId = request.params.guild;

		const guild = this.container.client.guilds.cache.get(guildId);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const member = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!member) return response.error(HttpCodes.BadRequest);

		if (!(await canManage(guild, member))) return response.error(HttpCodes.Forbidden);

		const emojis = await container.client.rest.get(Routes.guildEmojis(guildId));
		return response.json({ ...flattenGuild(guild), emojis });
	}
}
