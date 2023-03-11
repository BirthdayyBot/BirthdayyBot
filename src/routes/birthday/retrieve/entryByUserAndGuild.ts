import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'birthday/retrieve/entryByUserAndGuild',
        });
    }

    public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
        const { query } = _request;
        const { guild_id, user_id } = query;

        if (!guild_id && !user_id) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - guild_id and user_id';
            return response.json({ error: 'Missing Parameter - guild_id and user_id' });
        } else if (!guild_id) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - guild_id';
            return response.json({ error: 'Missing Parameter - guild_id' });
        } else if (!user_id) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - user_id';
            return response.json({ error: 'Missing Parameter - user_id' });
        }

        const [results] = await container.sequelize.query(
            `SELECT id, u.user_id AS user_id, birthday, username, discriminator, guild_id AS guild_id
            FROM birthday b
                     INNER JOIN user u ON b.user_id = u.user_id
            WHERE b.guild_id = ?
              AND b.user_id = ?
              AND b.disabled = false`,
            {
                replacements: [guild_id, user_id],
            },
        );
        response.statusCode = 200;
        response.statusMessage = 'OK';
        response.json(results);
    }
}
