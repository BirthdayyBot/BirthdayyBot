import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			route: 'birthday/retrieve/entryByUserAndGuild'
		});
	}

	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		const a = await main();
		async function main() {
			// let resp = {
			// 	success: false,
			// 	code: 500,
			// 	message: 'SOMETHING WENT WRONG',
			// 	data: {
			// 		guild_id: guild_id
			// 	},
			// 	result: []
			// };
			const [results] = await container.sequelize.query(`
            SELECT id, u.user_id AS user_id, birthday, username, discriminator, guild_id AS guild_id
            FROM birthday b
                     INNER JOIN user u ON b.user_id = u.user_id
            WHERE b.guild_id = "766707453994729532"
              AND b.user_id = "267614892821970945"
              AND b.disabled = false`);
			return results;
		}
		response.json(a);
	}
}
