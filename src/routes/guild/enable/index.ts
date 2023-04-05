import { container } from '@sapphire/pieces';
import { type ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { ApiRequest } from '../../../lib/api/types';
import { authenticated } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'guild/enable' })
export class UserRoute extends Route {
	@authenticated()
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const { query } = request;
		const { guildId } = query;

		const guild = await container.utilities.guild.update.DisableGuildAndBirthdays(guildId, false);

		if (!guild) return response.badRequest({ error: 'Guild not found' });

		return response.ok({ message: `Guild ${guildId as string} enabled`, guild });
	}
}
