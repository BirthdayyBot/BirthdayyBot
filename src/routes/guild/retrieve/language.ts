import { container } from '@sapphire/pieces';
import { type ApiRequest, type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { authenticated } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/retrieve/language' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const guildID = _request.query.guild_id as string;

		const results = await container.utilities.guild.get.GuildLanguage(guildID);

		return response.ok(results);
	}
}
