import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { APP_ENV } from '../helpers/provide/environment';

@ApplyOptions<ScheduledTask.Options>({ name: 'CleaningTask', pattern: '0 0 * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run() {
		this.container.logger.debug('[CleaningTask] Started');
		if (APP_ENV === 'prd') {
			const oneDayAgo = new Date();
			oneDayAgo.setDate(oneDayAgo.getDate() - 1);

			// Delete all guilds and birthdays that are disabled and haven't been updated in the last 24 hours
			const deletedGuilds = await this.container.utilities.guild.delete.ByLastUpdateDisable(oneDayAgo);
			const deletedBirthdays = await this.container.utilities.birthday.delete.ByLastUpdateDisable(oneDayAgo);
			this.container.logger.info(`[CleaningTask] Deleted ${deletedGuilds} guilds and ${deletedBirthdays} birthdays`);
		}

		this.container.logger.debug('[CleaningTask] Done');
	}
}
