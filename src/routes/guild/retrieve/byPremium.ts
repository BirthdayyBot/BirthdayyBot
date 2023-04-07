import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, Route, methods } from '@sapphire/plugin-api';
import getPremiumGuilds from '../../../lib/premium/getGuilds';

@ApplyOptions<Route.Options>({
	name: 'byPremium',
	route: 'guild/retrieve/byPremium',
})
export class GuildsPremium extends Route {
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const guilds = await getPremiumGuilds();

		return response.status(200).json(guilds);
	}
}
