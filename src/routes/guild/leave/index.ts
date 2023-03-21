import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import type { GuildConfigRawModel } from '../../../lib/model';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/leave' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.POST](request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { query } = request;
		const { guild_id } = query;

		const result: any = await container.sequelize.query('SELECT guild_id, premium FROM guild WHERE guild_id = ?', {
			replacements: [guild_id],
			type: 'SELECT',
		});
		const selectGuild: GuildConfigRawModel = result[0];

		if (!selectGuild) {
			return response.status(404).json({ error: 'Guild not found' });
		}

		const [_disableGuild] = await container.sequelize.query('UPDATE guild SET disabled = 1 WHERE guild_id = ?', {
			replacements: [guild_id],
		});

		const [_disableBirthdays] = await container.sequelize.query('UPDATE birthday SET disabled = 1 WHERE guild_id = ?', {
			replacements: [guild_id],
		});

		return response.ok({ message: `Guild ${guild_id} left` });
	}
}
