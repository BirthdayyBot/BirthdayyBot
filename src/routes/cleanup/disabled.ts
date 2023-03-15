import { container } from '@sapphire/framework';
import { ApiRequest, methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { QueryTypes } from 'sequelize';
import { DEBUG } from '../../helpers/provide/environment';
import { authenticated } from '../../lib/api/utils';

export class UserRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            name: 'cleanup/disabled',
            route: 'cleanup/disabled',
        });
    }

    @authenticated()
    public async [methods.DELETE](_request: ApiRequest, response: ApiResponse) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        DEBUG ? container.logger.debug('oneDayAgo.toISOString()', oneDayAgo.toISOString()) : null;

        const disabled_guilds = await container.sequelize.query(
            `SELECT guild_id FROM guild
			WHERE last_updated < '${oneDayAgo.toISOString()}' AND disabled = true`,
            { type: 'SELECT' },
        );

        const deleteRequest = await this.deleteDisabledEntries(disabled_guilds);
        // const deleteRequest = await this.deleteDisabledEntries([{ guild_id: '123' }, { guild_id: '555' }]);
        return response.status(200).json({
            count: {
                disabled_guilds: disabled_guilds ? disabled_guilds.length : 0,
                deleteRequest: deleteRequest ? deleteRequest.length : 0,
            },
            deleteRequest,
        });
    }

    public async deleteDisabledEntries(guild_ids: any[]): Promise<string[]> {
        const cleanIds = guild_ids.map((obj) => obj.guild_id);
        try {
            await container.sequelize.query(`DELETE FROM guild WHERE guild_id IN (${cleanIds.join(', ')})`, {
                type: QueryTypes.DELETE,
            });
            await container.sequelize.query(`DELETE FROM birthday WHERE guild_id IN (${cleanIds.join(', ')})`, {
                type: QueryTypes.DELETE,
            });
        } catch (error) {
            container.logger.error('[DELETE_DISABLE_ENTRIES] ', error);
            return [];
        }
        return cleanIds;
    }
}
