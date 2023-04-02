import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ApiRequest, methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { DEBUG } from '../../helpers/provide/environment';
import { authenticated } from '../../lib/api/utils';

@ApplyOptions<Route.Options>({ route: 'cleanup/disabled' })
export class UserRoute extends Route {
	@authenticated()
	public [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
		const oneDayAgo = new Date();
		oneDayAgo.setDate(oneDayAgo.getDate() - 1);
		DEBUG ? container.logger.debug('oneDayAgo.toISOString()', oneDayAgo.toISOString()) : null;

		// ! TODO: #140 Issue with the async transaction
		// const [guilds, birthdays] = await container.prisma.$transaction([
		// 	container.utilities.guild.delete.ByLastUpdatedDisabled(oneDayAgo),
		// 	container.utilities.birthday.delete.ByLastUpdatedDisabled(oneDayAgo),
		// ]);

		return response.ok({
			// count: {
			// 	delete_guilds: guilds.count,
			// 	delete_birthdays: birthdays.count,
			// },
		});
	}
}
