import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import type { GuildConfigRawModel } from '../../../lib/model';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'config/retrieve/byGuild',
        });
    }


    @authenticated()
    @validateParams<GuildQuery>()
    public async [methods.GET](_request: ApiRequest<GuildQuery>, response: ApiResponse) {
        const { guild_id } = _request.query;

        const [results] = await container.sequelize.query(
            `
        SELECT guild_id,
            announcement_channel,
            announcement_message,
            overview_channel,
            birthday_role,
            birthday_ping_role,
            overview_message,
            log_channel,
            timezone,
            language,
            premium
        FROM guild WHERE guild_id = ? AND disabled = 0`,
            {
                replacements: [guild_id],
            },
        );
        if (results.length === 0) {
            return response.status(404).json({ error: 'Guild not Found' });
        }
        const config: GuildConfigRawModel = results[0] as GuildConfigRawModel;
        return response.status(200).json({ config: config });
    }
}
