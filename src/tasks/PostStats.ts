import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { isNotPrd, isPrd } from '../helpers/provide/environment';

@ApplyOptions<ScheduledTask.Options>({
	name: 'PostStats',
	enabled: isPrd,
	pattern: '0 * * * *',
})
export class PostStats extends ScheduledTask {
	public run() {
		if (isNotPrd) return;

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
