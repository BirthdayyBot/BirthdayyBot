import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'birthday/retrieve/entriesByGuild' })
export class UserRoute extends Route {

    @authenticated()
    @validateParams<GuildQuery>()
    public async [methods.GET](_request: ApiRequest<GuildQuery>, response: ApiResponse) {
        const { guild_id } = _request.query;

        const [results] = await container.sequelize.query(
            `    SELECT id, b.user_id, birthday, username, discriminator, b.guild_id
            FROM birthday b
                     LEFT JOIN user u ON b.user_id = u.user_id
            WHERE guild_id = ?
              AND b.disabled = false`,
            {
                replacements: [guild_id],
            },
        );

        if (results.length === 0) return response.badRequest({ error: 'Guild not Found' });

        return response.ok({ amount: results.length, birthdays: results });
    }
}
