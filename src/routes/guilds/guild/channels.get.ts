import { flattenChannel } from '#lib/api/ApiTransformers';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, Route, type RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'guilds/:guild/channels' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(seconds(5), 2, true)
	public async run(request: ApiRequest, response: ApiResponse) {
		const guildId = request.params.guild;

		const guild = this.container.client.guilds.cache.get(guildId);
		if (!guild) return response.error(HttpCodes.BadRequest);

		const member = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!member) return response.error(HttpCodes.BadRequest);

		if (!(await canManage(guild, member))) return response.error(HttpCodes.Forbidden);

		return response.json(guild.channels.cache.map(flattenChannel));
	}
}
