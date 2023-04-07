import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { authenticated } from '../../../lib/api/utils';
import getPremiumGuilds from '../../../lib/premium/getGuilds';

@ApplyOptions<Route.Options>({
	name: 'byPremium',
	route: 'guild/retrieve/byPremium',
})
export class PremiumGuilds extends Route {
	@authenticated()
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const guilds = await getPremiumGuilds();

		return response.status(200).json(guilds);
	}
}
