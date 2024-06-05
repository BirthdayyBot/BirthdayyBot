import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, type RouteOptions } from '@sapphire/plugin-api';
import { s } from '@sapphire/shapeshift';

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
		const settingsDataSchema = s.object({
			guild_id: s.string,
			data: s.array(s.tuple([s.string, s.unknown]))
		});

		const requestBody = settingsDataSchema.parse(request.body);

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

		try {
			const data = Object.fromEntries(requestBody.data);
			const updatedSettings = await this.container.prisma.guild.upsert({
				where: { guildId: requestBody.guild_id },
				create: { ...data, guildId: requestBody.guild_id },
				update: data
			});

			return response.status(HttpCodes.OK).json(updatedSettings);
		} catch (errors) {
			return response.status(HttpCodes.BadRequest).json(errors);
		}
	}
}
