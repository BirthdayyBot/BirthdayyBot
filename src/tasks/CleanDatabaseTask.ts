import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import dayjs from 'dayjs';
import { inlineCode } from 'discord.js';
import { BOT_ADMIN_LOG } from '../helpers/provide/environment';
import { sendMessage } from '../lib/discord';
import { generateDefaultEmbed } from '../lib/utils/embed';

@ApplyOptions<ScheduledTask.Options>({
	name: 'CleanDatabaseTask',
	pattern: '0 0 * * *',
	enabled: true,
})
export class CleanDatabaseTask extends ScheduledTask {
	public async run() {
		this.container.logger.debug('[CleaningTask] Started');
		const oneDayAgo = dayjs().subtract(1, 'day').toDate();

		const req = await container.utilities.guild.delete.ByLastUpdatedDisabled(oneDayAgo);
		container.logger.info('CleanDatabaseTask ~ run ~ req:', req);
		const { deletedBirthdays, deletedGuilds } = req;

		await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateDefaultEmbed({
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

		return req;
	}
}
