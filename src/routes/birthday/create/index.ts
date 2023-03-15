import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { QueryTypes } from 'sequelize';
import { isDateString } from '../../../helpers/utils/date';
import type { ApiRequest, BirthdayQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { APIErrorCode } from '../../../lib/enum/APIErrorCode.enum';

export class BirthdayCreateRoute extends Route {
    public constructor(context: Route.Context, options: Route.Options) {
        super(context, {
            ...options,
            name: 'birthday/create',
            route: 'birthday/create',
        });
    }

    @authenticated()
    @validateParams<BirthdayQuery>(['guild_id', 'user_id', 'date'])
    public async [methods.POST](request: ApiRequest<BirthdayQuery>, response: ApiResponse) {

        const { date, user_id, guild_id, username = null, discriminator = null } = request.query;
        if (!date) {
            response.statusMessage = 'Missing Parameter - date';
            return response
                .status(400)
                .json({ success: false, error: { code: APIErrorCode.MISSING_PARAMETER, message: 'Missing Parameter - date' } });
        }

        if (!user_id) {
            response.statusMessage = 'Missing Parameter - timezone';
            return response
                .status(400)
                .json({ success: false, error: { code: APIErrorCode.MISSING_PARAMETER, message: 'Missing Parameter - user_id' } });
        }

        if (!guild_id) {
            response.statusMessage = 'Missing Parameter - guild_id';
            return response
                .status(400)
                .json({ success: false, error: { code: APIErrorCode.MISSING_PARAMETER, message: 'Missing Parameter - guild_id' } });
        }

        if (typeof date !== 'string') {
            return response.status(400).json({ error: { code: APIErrorCode.INVALID_PARAMETER, message: 'Parameter date is not a string' } });
        }
        if (typeof user_id !== 'string') {
            return response.status(400).json({ error: { code: APIErrorCode.INVALID_PARAMETER, message: 'Parameter user_id is not a string' } });
        }
        if (typeof guild_id !== 'string') {
            return response.status(400).json({ error: { code: APIErrorCode.INVALID_PARAMETER, message: 'Parameter guild_id is not a string' } });
        }

        const isDate = isDateString(date);

        if (!isDate) {
            response.statusMessage = 'Wrong Date Format use YYYY-MM-DD or XXXX-MM-DD';
            return response.status(400).json({
                success: false,
                error: { code: APIErrorCode.INVALID_DATE_FORMAT, message: 'Wrong Date Format use YYYY-MM-DD or XXXX-MM-DD' },
            });
        }

        // Create User if not exists
        await container.sequelize.query('INSERT IGNORE INTO user (user_id, username, discriminator) VALUES (?,?,?)', {
            replacements: [user_id, username, discriminator],
            type: QueryTypes.INSERT,
        });

        try {
            // Create Birthday
            await container.sequelize.query('INSERT INTO birthday (user_id, birthday, guild_id) VALUES (?,?,?)', {
                replacements: [user_id, date, guild_id],
                type: QueryTypes.INSERT,
            });
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                response.statusMessage = 'User already has a birthday registered';
                return response
                    .status(200)
                    .json({ success: false, error: { code: APIErrorCode.DUPLICATE_ENTRY, message: 'User already has a birthday registered' } });
            }

            response.statusMessage = 'Something went wrong';
            return response
                .status(500)
                .json({ error: { code: APIErrorCode.UNKNOWN_ERROR, message: error.message ?? error.name ?? 'Something went wrong' } });
        }
        return response.status(201).json({ success: true });
    }
}
