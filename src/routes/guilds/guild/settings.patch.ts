import { ApiRequest, ApiResponse, HttpCodes, Route, type RouteOptions } from '@sapphire/plugin-api';
import { authenticated, canManage, ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { s } from '@sapphire/shapeshift';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<RouteOptions>({ name: 'guildSettingsPost', route: 'guilds/:guild/settings' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(seconds(1), 2, true)
	public async run(request: ApiRequest, response: ApiResponse) {
		const settingsDataSchema = s.object({
			guild_id: s.string(),
			data: s.array(s.tuple([s.string(), s.unknown()]))
		});

		const requestBody = await request.readValidatedBodyJson((data) => settingsDataSchema.parse(data));

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
				where: { id: requestBody.guild_id },
				create: { ...data, id: requestBody.guild_id },
				update: data
			});

			return response.status(HttpCodes.OK).json(updatedSettings);
		} catch (errors) {
			return response.status(HttpCodes.BadRequest).json(errors);
		}
	}
}
