import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { QueryTypes } from 'sequelize';
import { parseBoolean } from '../../../helpers/utils/utils';
import type { ApiRequest, GuildQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';

type GuildRetrieveQuery = GuildQuery & {
    disable?: string;
}
export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'guild/retrieve/is-available',
        });
    }

    @authenticated()
    @validateParams<GuildRetrieveQuery>(['guild_id'])
    public async [methods.GET](request: ApiRequest<GuildRetrieveQuery>, response: ApiResponse) {
        const { query } = request;
        const guild_id = query.guild_id;
        const disable = parseBoolean(query.disable ? query.disable.toString() : 'false');

        try {
            const guild = await container.client.guilds.fetch({
                guild: guild_id,
                withCounts: false,
            });
            return response.ok({ is_available: guild ? true : false, data: guild ? guild : null });
        } catch (error: any) {
            if (error.message === 'Unknown Guild') {
                if (disable) {
                    const disableGuildResult = await disableGuild(guild_id);
                    const disableBirthdayResult = await disableBirthday(guild_id);
                    return response.badRequest({
                        is_available: false,
                        data: { guild_id, disabledGuild: disableGuildResult, disabledBirthdays: disableBirthdayResult },
                    });
                }
                return response.badRequest({ is_available: false, data: { guild_id } });
            }
            return response.badRequest({ is_available: false, data: { guild_id }, error: { message: error.message } });
        }
        async function disableGuild(guild: string) {
            const guildDisabeld = await container.sequelize.query('UPDATE guild SET disabled = true WHERE guild_id = ?', {
                replacements: [guild],
                type: QueryTypes.UPDATE,
            });
            return guildDisabeld[1];
        }
        async function disableBirthday(guild: string) {
            const birthdayDisabeld = await container.sequelize.query('UPDATE birthday SET disabled = true WHERE guild_id = ?', {
                replacements: [guild],
                type: QueryTypes.UPDATE,
            });
            return birthdayDisabeld[1];
        }
    }
}
