import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
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
		const { guild_id, inviter } = request.query;

		const guild = await container.utilities.guild.create({ guild_id, inviter });

		if (!guild) return response.badRequest({ message: 'Guild already exists', guild_id, inviter: inviter });

		return response.ok({ message: `Guild ${guild_id} created`, guild });
	}
}
