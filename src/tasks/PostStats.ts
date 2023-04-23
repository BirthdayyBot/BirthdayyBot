import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { envIs } from '../lib/utils/env';

@ApplyOptions<ScheduledTask.Options>({
	name: 'PostStats',
	enabled: envIs('APP_ENV', 'production'),
	pattern: '0 * * * *',
})
export class PostStats extends ScheduledTask {
	public run() {
		if (!envIs('APP_ENV', 'production')) return;

		return this.container.botList
			.postStats()
			.then(() => {
				this.container.logger.info('Posted stats to bot lists.');
			})
			.catch((err) => {
				this.container.logger.error('Failed to post stats to bot lists.');
				this.container.logger.error(err);
			});
	}
}
