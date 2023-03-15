import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'guild/retrieve/is-disabled',
        });
    }

    @authenticated()
    @validateParams<GuildQuery>()
    public async [methods.GET](request: ApiRequest<GuildQuery>, response: ApiResponse) {
        const { query } = request;
        const { guild_id } = query;

        const [results] = await container.sequelize.query('SELECT guild_id FROM guild WHERE guild_id = ? AND disabled = 1', {
            replacements: [guild_id],
        });

        return response.status(200).json({ is_disabled: results.length > 0 });
    }
}
