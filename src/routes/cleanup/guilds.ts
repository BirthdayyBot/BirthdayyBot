import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { authenticated } from '../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { updateGuildsNotInAndBirthdays, whereGuildsNotIn } from '../../lib/db';

@ApplyOptions<Route.Options>({ route: 'cleanup/guilds' })
export class CleanUpGuildsRoute extends Route {
	@authenticated()
	public async [methods.POST](_request: ApiRequest, response: ApiResponse) {

		const guildIds = (await container.client.guilds.fetch()).map((guild) => guild.id);


		const guilds = await container.prisma.guild.updateMany({
			...whereGuildsNotIn(guildIds),
			...updateGuildsNotInAndBirthdays(guildIds, true),
		});

		return response.ok({
			cleaned_guilds_count: guilds.count,
			cleaned_guilds: guilds,
		});
	}
}