import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { DEBUG } from '../../../helpers/provide/environment';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

type GuildCreateQuery = GuildQuery & {
    inviter: string;
}

@ApplyOptions<Route.Options>({ route: 'guild/create' })
export class UserRoute extends Route {

    @authenticated()
    @validateParams(['guild_id', 'inviter'])
    public async [methods.POST](request: ApiRequest<GuildCreateQuery>, response: ApiResponse) {
        const { guild_id, inviter } = request.query;

        try {
            const [_createGuild] = await container.sequelize.query('INSERT INTO guild (guild_id, inviter) VALUES (?,?)', {
                replacements: [guild_id, inviter],
            });
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return response.badRequest({ message: 'Guild already exists', guild_id, inviter: inviter });
            }
            DEBUG ? container.logger.error(error) : null;
            return response.error(error);
        }
        return response.ok({ message: `Guild ${guild_id} created` });
    }
}
