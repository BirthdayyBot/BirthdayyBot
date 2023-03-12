import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { QueryTypes } from 'sequelize';
import { parseBoolean } from '../../../helpers/utils/utils';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            route: 'guild/retrieve/is-available',
        });
    }

    public async [methods.GET](request: ApiRequest, response: ApiResponse) {
        const { query } = request;
        let guild_id = query.guild_id;
        const disable = parseBoolean(query.disable ? query.disable.toString() : 'false');
        if (!guild_id) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - guild_id';
            return response.json({ error: 'Missing Parameter - guild_id' });
        }
        guild_id = guild_id.toString();
        try {
            const guild = await container.client.guilds.fetch({
                guild: guild_id,
                withCounts: false,
            });
            return response.status(200).json({ is_available: guild ? true : false, data: guild ? guild : null });
        } catch (error: any) {
            if (error.message === 'Unknown Guild') {
                if (disable) {
                    const disableGuildResult = await disableGuild(guild_id);
                    const disableBirthdayResult = await disableBirthday(guild_id);
                    return response.status(404).json({
                        is_available: false,
                        data: { guild_id, disabledGuild: disableGuildResult, disabledBirthdays: disableBirthdayResult },
                    });
                }
                return response.status(404).json({ is_available: false, data: { guild_id } });
            }
            return response.status(404).json({ is_available: false, data: { guild_id }, error: { message: error.message } });
        }
        async function disableGuild(guild: string) {
            const guildDisabeld = await container.db.query('UPDATE guild SET disabled = true WHERE guild_id = ?', {
                replacements: [guild],
                type: QueryTypes.UPDATE,
            });
            return guildDisabeld[1];
        }
        async function disableBirthday(guild: string) {
            const birthdayDisabeld = await container.db.query('UPDATE birthday SET disabled = true WHERE guild_id = ?', {
                replacements: [guild],
                type: QueryTypes.UPDATE,
            });
            return birthdayDisabeld[1];
        }
    }
}
