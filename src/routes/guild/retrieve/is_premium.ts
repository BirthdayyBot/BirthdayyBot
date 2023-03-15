import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { parseBoolean } from '../../../helpers/utils/utils';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'guild/retrieve/is-premium',
        });
    }


    @authenticated()
    @validateParams<GuildQuery>()
    public async [methods.GET](request: ApiRequest<GuildQuery>, response: ApiResponse) {
        const { guild_id } = request.query;

        const [results] = await container.sequelize.query('SELECT guild_id, premium FROM guild g WHERE guild_id = ? AND disabled = false', {
            replacements: [guild_id],
        });
        container.logger.info('results', results);

        if (results.length === 0) return response.badRequest({ error: 'Guild not Found' });

        const is_premium = parseBoolean(`${(results[0] as { premium: string | boolean}).premium}`);
        return response.ok(is_premium);
    }
}
