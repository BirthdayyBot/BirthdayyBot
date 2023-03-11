import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { extractDayAndMonth } from '../../../helpers/utils/date';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'birthday/retrieve/byDateAndTimezone',
        });
    }

    public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
        const { query } = _request;
        const { date, timezone } = query;

        if (!date) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - date';
            return response.json({ error: 'Missing Parameter - date' });
        }

        if (!timezone) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - timezone';
            return response.json({ error: 'Missing Parameter - timezone' });
        }

        if (typeof date !== 'string') {
            response.statusCode = 400;
            response.statusMessage = 'Invalid Parameter - date';
            return response.json({ error: 'Invalid Parameter - date' });
        }

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
            response.statusCode = 404;
            response.statusMessage = 'No Birthdays found on that Date and Timezone';
            return response.json({ error: 'No Birthdays found on that Date and Timezone' });
        }

        const birthdays = results as Array<any>;
        return response.status(200).json({ amount: birthdays.length, birthdays: results });
    }
}
