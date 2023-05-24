import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { Time } from '@sapphire/time-utilities';
import { authenticated } from '../../lib/api/utils';

@ApplyOptions<Route.Options>({ name: 'stats', route: 'stats' })
export class StatsRoute extends Route {
	@authenticated()
	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		interface StatsModel {
			guilds: number;
			users: number;
			birthdays: number;
		}
		const stats = await getCache();
		return response.json(stats);

		async function getCache() {
			const CACHE_DURATION = Time.Minute * 30; // 30 minutes

			let cache_date = 0;
			let cache: StatsModel | null = null;

			const users: number = await container.botList.computeUsers();
			const guilds = await container.botList.computeGuilds();
			const birthdays = await container.utilities.birthday.get.BirthdayAvailableCount();

			if (cache === null || Date.now() - cache_date > CACHE_DURATION) {
				cache = {
					guilds,
					users,
					birthdays,
				};
				cache_date = Date.now();
			}
			return cache;
		}
	}
}
