import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

type GuildCreateQuery = GuildQuery & {
	inviter: string;
};

@ApplyOptions<Route.Options>({ route: 'guild/create' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams(['guild_id', 'inviter'])
	public async [methods.POST](request: ApiRequest<GuildCreateQuery>, response: ApiResponse) {
		const { guildId, inviter } = request.query;

		const guild = await container.utilities.guild.create({ guildId, inviter });

		if (!guild) return response.badRequest({ message: 'Guild already exists', guildId, inviter: inviter });

		return response.ok({ message: `Guild ${guildId} created`, guild });
	}
}
