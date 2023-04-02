import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import dayjs from 'dayjs';
import { APP_ENV } from '../helpers/provide/environment';

@ApplyOptions<ScheduledTask.Options>({ name: 'CleaningTask', pattern: '0 0 * * *', enabled: APP_ENV === 'prd' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run() {
		this.container.logger.debug('[CleaningTask] Started');

		const oneDayAgo = dayjs().subtract(1, 'day').toDate();

		// Delete all guilds and birthdays that are disabled and haven't been updated in the last 24 hours
		const deletedGuilds = await this.container.utilities.guild.delete.ByLastUpdatedDisabled(oneDayAgo);
		const deletedBirthdays = await this.container.utilities.birthday.delete.ByLastUpdatedDisabled(oneDayAgo);
		this.container.logger.info(
			`[CleaningTask] Deleted ${deletedGuilds.count} guilds and ${deletedBirthdays.count} birthdays`,
		);

		this.container.logger.debug('[CleaningTask] Done');
	}
}
