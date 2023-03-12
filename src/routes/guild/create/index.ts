import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ApiVerification } from '../../../helpers/provide/api_verification';
import { DEBUG } from '../../../helpers/provide/environment';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            name: 'guild/create',
            route: 'guild/create',
            enabled: true,
        });
    }

    public async [methods.POST](request: ApiRequest, response: ApiResponse) {
        const { query } = request;
        const { guild_id, inviter } = query;

        if (!(await ApiVerification(request))) {
            return response.status(401).json({ error: 'Unauthorized' });
        }
        if (!guild_id) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - guild_id';
            return response.json({ error: 'Missing Parameter - guild_id' });
        }
        if (!inviter) {
            response.statusCode = 400;
            response.statusMessage = 'Missing Parameter - inviter';
            return response.json({ error: 'Missing Parameter - inviter' });
        }
        const inviter_id = inviter.toString().toLowerCase() === 'null' ? null : inviter;

        try {
            const [_createGuild] = await container.db.query('INSERT INTO guild (guild_id, inviter) VALUES (?,?)', {
                replacements: [guild_id, inviter_id],
            });
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return response.status(200).json({ message: 'Guild already exists', guild_id, inviter: inviter_id });
            }
            DEBUG ? container.logger.error(error) : null;
            return response.status(500).json({ error: error.message });
        }
        return response.status(200).json({ message: `Guild ${guild_id} created` });
    }
}
