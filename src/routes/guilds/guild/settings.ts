import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, Route, type RouteOptions, methods } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ name: 'guildSettings', route: 'guilds/:guild/settings' })
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

		return this.container.prisma.guild.findUnique({ where: { guildId } });
	}

	@authenticated()
	@ratelimit(seconds(1), 2, true)
	public async [methods.PATCH](request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as { guild_id: string; data: [string, unknown][] | undefined };

		if (
			!requestBody.guild_id ||
			!Array.isArray(requestBody.data) ||
			requestBody.guild_id !== request.params.guild
		) {
			return response.status(HttpCodes.BadRequest).json(['Invalid body.']);
		}

		const guild = this.container.client.guilds.cache.get(requestBody.guild_id);
		if (!guild) return response.status(HttpCodes.BadRequest).json(['Guild not found.']);

		const member = await guild.members.fetch(request.auth!.id).catch(() => null);
		if (!member) return response.status(HttpCodes.BadRequest).json(['Member not found.']);

		if (!(await canManage(guild, member))) return response.error(HttpCodes.Forbidden);

		const entries = requestBody.data;

		try {
			const settings = await this.container.prisma.guild.update({
				where: { guildId: requestBody.guild_id },
				data: {
					...entries.map((entry) => ({ [entry[0]]: entry[1] }))
				}
			});

			return response.status(HttpCodes.OK).json(settings);
		} catch (errors) {
			return response.status(HttpCodes.BadRequest).json(errors);
		}
	}
}
