import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { extractDayAndMonth } from '../../../helpers/utils/date';
import type { ApiRequest } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

type Query = {
	date: string;
	timezone: string;
};

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/byDateAndTimezone' })
export class UserRoute extends Route {
	@authenticated()
	@validateParams<Query>()
	public async [methods.GET](request: ApiRequest<Query>, response: ApiResponse) {
		const { date, timezone } = request.query;
		const dateAndMonth = extractDayAndMonth(date);

		const [results] = await container.sequelize.query(
			`SELECT id,
            u.user_id AS user_id,
            b.birthday AS birthday,
            u.username AS username,
            u.discriminator AS discriminator,
            b.guild_id AS guild_id,
            g.announcement_channel  AS announcement_channel,
            g.overview_channel AS overview_channel,
            g.birthday_role AS birthday_role,
            g.birthday_ping_role AS birthday_ping_role,
            g.overview_message  AS overview_message,
            g.log_channel AS log_channel,
            g.timezone AS timezone,
            g.announcement_message AS announcement_message,
            g.premium AS premium
     FROM birthday b
              LEFT JOIN user u ON b.user_id = u.user_id
              LEFT JOIN guild g on b.guild_id = g.guild_id
     WHERE b.birthday LIKE '%${dateAndMonth}%'
       AND g.timezone = ?
       AND g.disabled = false`,
			{
				replacements: [timezone],
			},
		);

		if (results.length === 0) {
			return response.ok({ amount: 0, birthdays: [], message: 'No Birthdays found on that Date and Timezone' });
		}

		return response.ok({ amount: results.length, birthdays: results });
	}
}
