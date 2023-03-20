import { container } from '@sapphire/framework';
import { ApiRequest, methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { DEBUG } from '../../helpers/provide/environment';
import { authenticated } from '../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { whereGuildLastUpdated } from '../../lib/db';

@ApplyOptions<Route.Options>({ route: 'cleanup/disabled' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
		const oneDayAgo = new Date();
		oneDayAgo.setDate(oneDayAgo.getDate() - 1);
		DEBUG ? container.logger.debug('oneDayAgo.toISOString()', oneDayAgo.toISOString()) : null;

		const [guilds, birthdays] = await container.prisma.$transaction([
			container.prisma.guild.deleteMany({ ...whereGuildLastUpdated(oneDayAgo) }),
			container.prisma.birthday.deleteMany({ ...whereGuildLastUpdated(oneDayAgo) }),
		]);

		return response.ok({
			count: {
				delete_guilds: guilds.count,
				delete_birthdays: birthdays.count,
			},
		});
	}
}
