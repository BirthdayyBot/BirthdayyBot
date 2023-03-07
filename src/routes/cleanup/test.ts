import { container } from '@sapphire/framework';
import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { ApiVerification } from '../../helpers/provide/api_verification';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			name: 'cleanup/test',
			route: 'cleanup/test'
		});
	}

	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		if (!(await ApiVerification(request))) {
			return response.status(401).json({ error: 'Unauthorized' });
		}
		const [db_guilds] = await container.sequelize.query(
			// `SELECT guild_id FROM guild
			// WHERE  disabled = false`
			`SELECT guild_id FROM guild`
		);
		console.log('db_guilds', db_guilds);
		let affectedGuilds: any[] = [];
		const guildPromises = db_guilds.map(async (guild: any) => {
			//replace with for (const guild of db_guilds) {
			//check if guild exists in discord
			try {
				const guildExists = await container.client.guilds.fetch(guild.guild_id);
				console.log('guild exists', guildExists.id);
			} catch (error: any) {
				if (error.message === 'Unknown Guild') {
					console.log('guild does not exist', guild.guild_id);
					//disable guild
					const [_disableguild, disableGuildMeta] = await container.sequelize.query(
						`UPDATE guild SET disabled = true WHERE guild_id = '${guild.guild_id}'`,
						{
							type: 'UPDATE'
						}
					);
					console.log('disableGuildMeta', disableGuildMeta);
					//disable birthdays with guild_id
					const [_disablebirthdays, disablebirthdaysMeta] = await container.sequelize.query(
						`UPDATE birthday SET disabled = true WHERE guild_id = '${guild.guild_id}'`,
						{
							type: 'UPDATE'
						}
					);
					console.log('disablebirthdaysMeta', disablebirthdaysMeta);
					affectedGuilds = affectedGuilds.concat({
						guild_id: guild.guild_id,
						guild_disabled: disableGuildMeta,
						birthdays_disabled: disablebirthdaysMeta
					});
				} else {
					console.log('error', error.message);
				}
			}
		});
		console.log('guildPromises', guildPromises);
		console.log('affectedGuilds', affectedGuilds);

		return response.status(200).json({ db_guilds, affectedGuilds });
	}
}
