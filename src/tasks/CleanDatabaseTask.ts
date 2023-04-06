import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import dayjs from 'dayjs';
import { inlineCode } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { BOT_ADMIN_LOG } from '../helpers/provide/environment';
import { sendMessage } from '../lib/discord';
import { isNotDev } from '../lib/utils/config';

@ApplyOptions<ScheduledTask.Options>({ name: 'CleaningTask', pattern: '0 0 * * *', enabled: isNotDev })
export class BirthdayReminderTask extends ScheduledTask {
	public async run() {
		this.container.logger.debug('[CleaningTask] Started');

		const oneDayAgo = dayjs().subtract(1, 'day').toDate();

		// Delete all guilds and birthdays that are disabled and haven't been updated in the last 24 hours
		const deletedGuilds = await this.container.utilities.guild.delete.ByLastUpdatedDisabled(oneDayAgo);
		const deletedBirthdays = await this.container.utilities.birthday.delete.ByLastUpdatedDisabled(oneDayAgo);
		const deletedGuildsCount = deletedGuilds.count;
		const deletedBirthdaysCount = deletedBirthdays.count;

		await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateEmbed({
					title: 'CleanUp Report',
					description: '',
					fields: [
						{ name: 'Deleted Guilds', value: inlineCode(deletedGuildsCount.toString()), inline: true },
						{
							name: 'Deleted Birthdays',
							value: inlineCode(deletedBirthdaysCount.toString()),
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
