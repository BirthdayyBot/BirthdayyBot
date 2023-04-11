import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import dayjs from 'dayjs';
import { inlineCode } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { BOT_ADMIN_LOG, isNotDev } from '../helpers/provide/environment';
import { sendMessage } from '../lib/discord';
import { container } from '@sapphire/framework';

@ApplyOptions<ScheduledTask.Options>({ name: 'CleanDatabaseTask', pattern: '0 0 * * *', enabled: isNotDev })
export class CleanDatabaseTask extends ScheduledTask {
	public async run() {
		this.container.logger.debug('[CleaningTask] Started');

		const oneDayAgo = dayjs().subtract(1, 'day').toDate();

		// Delete all guilds and birthdays that are disabled and haven't been updated in the last 24 hours

		const [deletedBirthdays, deletedGuilds] = await container.utilities.guild.delete.ByLastUpdatedDisabled(
			oneDayAgo,
		);

		await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateEmbed({
					title: 'CleanUp Report',
					description: '',
					fields: [
						{ name: 'Deleted Guilds', value: inlineCode(deletedGuilds.count.toString()), inline: true },
						{
							name: 'Deleted Birthdays',
							value: inlineCode(deletedBirthdays.count.toString()),
							inline: true,
						},
					],
				}),
			],
		});

		this.container.logger.info(
			`[CleaningTask] Deleted ${deletedGuilds.count} guilds and ${deletedBirthdays.count} birthdays`,
		);

		this.container.logger.debug('[CleaningTask] Done');
	}
}
