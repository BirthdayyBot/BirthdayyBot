import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/enable' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<GuildQuery>()
	public async [methods.POST](request: ApiRequest<GuildQuery>, response: ApiResponse) {
		const { query } = request;
		const { guild_id } = query;

		const [_updateGuild, updateGuildMeta] = await container.sequelize.query('UPDATE guild SET disabled = 0 WHERE guild_id = ?', {
			replacements: [guild_id],
		});
		const [_updateBirthday, updateBirthdayMeta] = await container.sequelize.query('UPDATE birthday SET disabled = 0 WHERE guild_id = ?', {
			replacements: [guild_id],
		});

		const affectedRowsCountGuild = (updateGuildMeta as any).affectedRows;
		const affectedRowsCountBirthday = (updateBirthdayMeta as any).affectedRows;
		return response.ok({ affectedRowsCountGuild, affectedRowsCountBirthday });
	}
}
