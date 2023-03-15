import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import type { GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'guild/retrieve/language',
        });
    }


    @authenticated()
    @validateParams<GuildQuery>()
    public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
        const { query } = _request;
        const { guild_id } = query;

        const [results] = await container.sequelize.query('SELECT guild_id, language FROM guild g WHERE guild_id = ? AND disabled = false', {
            replacements: [guild_id],
        });

        response.statusCode = 200;
        response.statusMessage = 'OK';
        response.json(results[0]);
    }
}
