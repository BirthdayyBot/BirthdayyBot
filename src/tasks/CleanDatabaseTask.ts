import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import dayjs from 'dayjs';
import { inlineCode } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { BOT_ADMIN_LOG } from '../helpers/provide/environment';
import { sendMessage } from '../lib/discord';
import { envIs } from '../lib/utils/env';

@ApplyOptions<ScheduledTask.Options>({
	name: 'CleanDatabaseTask',
	pattern: '0 0 * * *',
	enabled: envIs('APP_ENV', 'production'),
})
export class CleanDatabaseTask extends ScheduledTask {
	public async run() {
		this.container.logger.debug('[CleaningTask] Started');
		const oneDayAgo = dayjs().subtract(1, 'day').toDate();

		const req = await container.utilities.guild.delete.ByLastUpdatedDisabled(oneDayAgo);
		const { deletedBirthdays, deletedGuilds } = req;

		await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateEmbed({
					title: `CleanUp Report (DELETE)`,
					description: '',
					fields: [
						{ name: 'Deleted Guilds', value: inlineCode(deletedGuilds.toString()), inline: true },
						{
							name: 'Deleted Birthdays',
							value: inlineCode(deletedBirthdays.toString()),
							inline: true,
						},
					],
				}),
			],
		});

		this.container.logger.info(`[CleaningTask] Deleted ${deletedGuilds} guilds and ${deletedBirthdays} birthdays`);

		this.container.logger.debug('[CleaningTask] Done');
	}
}
