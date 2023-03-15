import { container } from '@sapphire/framework';
import { methods, Route, type ApiResponse } from '@sapphire/plugin-api';
import { QueryTypes } from 'sequelize';
import { isDateString } from '../../../helpers/utils/date';
import type { ApiRequest, BirthdayQuery } from '../../../lib/api/types';
import { authenticated, validateParams } from '../../../lib/api/utils';
import { APIErrorCode } from '../../../lib/enum/APIErrorCode.enum';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({ route: 'birthday/create' })
export class BirthdayCreateRoute extends Route {

    @authenticated()
    @validateParams<BirthdayQuery>(['guild_id', 'user_id', 'date'])
    public async [methods.POST](request: ApiRequest<BirthdayQuery>, response: ApiResponse) {
        const { date, user_id, guild_id, username = null, discriminator = null } = request.query;

        const isDate = isDateString(date);

        if (!isDate) {
            return response.badRequest({
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
                return response.badRequest({
                    success: false,
                    error: {
                        code: APIErrorCode.DUPLICATE_ENTRY, message: 'User already has a birthday registered',
                    },
                });
            }

            return response.error(error);
        }
        return response.created({ success: true });
    }
}
