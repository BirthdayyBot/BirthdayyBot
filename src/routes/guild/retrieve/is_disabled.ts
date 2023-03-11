import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'guild/retrieve/is-disabled',
        });
    }

    public async [methods.GET](request: ApiRequest, response: ApiResponse) {
        const { query } = request;
        const { guild_id } = query;

        if (!guild_id) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - guild_id';
            return response.json({ error: 'Missing Parameter - guild_id' });
        }

        const [results] = await container.sequelize.query('SELECT guild_id FROM guild WHERE guild_id = ? AND disabled = 1', {
            replacements: [guild_id],
        });

        return response.status(200).json({ is_disabled: results.length > 0 });
    }
}
