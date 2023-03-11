import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ApiVerification } from '../../../helpers/provide/api_verification';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            name: 'guild/enable',
            route: 'guild/enable',
            enabled: true,
        });
    }

    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        const { query } = request;
        const { guild_id } = query;

        if (!(await ApiVerification(request))) {
            return response.status(401).json({ error: 'Unauthorized' });
        }
        if (!guild_id) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - guild_id';
            return response.json({ error: 'Missing Parameter - guild_id' });
        }

        const [_updateGuild, updateGuildMeta] = await container.sequelize.query('UPDATE guild SET disabled = 0 WHERE guild_id = ?', {
            replacements: [guild_id],
        });
        const [_updateBirthday, updateBirthdayMeta] = await container.sequelize.query('UPDATE birthday SET disabled = 0 WHERE guild_id = ?', {
            replacements: [guild_id],
        });

        const affectedRowsCountGuild = (updateGuildMeta as any).affectedRows;
        const affectedRowsCountBirthday = (updateBirthdayMeta as any).affectedRows;
        return response.status(200).json({ affectedRowsCountGuild, affectedRowsCountBirthday });
    }
}
