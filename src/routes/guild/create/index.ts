import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { DEBUG } from '../../../helpers/provide/environment';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';

type GuildCreateQuery = GuildQuery & {
    inviter: string;
}
export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            name: 'guild/create',
            route: 'guild/create',
            enabled: true,
        });
    }

    @authenticated()
    @validateParams(['guild_id', 'inviter'])
    public async [methods.POST](request: ApiRequest<GuildCreateQuery>, response: ApiResponse) {
        const { query } = request;
        const { guild_id, inviter } = query;

        try {
            const [_createGuild] = await container.sequelize.query('INSERT INTO guild (guild_id, inviter) VALUES (?,?)', {
                replacements: [guild_id, inviter],
            });
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return response.status(200).json({ message: 'Guild already exists', guild_id, inviter: inviter });
            }
            DEBUG ? container.logger.error(error) : null;
            return response.status(500).json({ error: error.message });
        }
        return response.status(200).json({ message: `Guild ${guild_id} created` });
    }
}
