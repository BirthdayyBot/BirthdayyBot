import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Result } from '@sapphire/result';
import { isProduction } from '../lib/utils/env';

@ApplyOptions<ScheduledTask.Options>({
	name: 'PostStats',
	enabled: isProduction,
	pattern: '0 * * * *',
})
export class PostStats extends ScheduledTask {
	public async run() {
		if (!isProduction) {
			return container.logger.info('[PostStats] Task skipped (not production)');
		}
		const result = await Result.fromAsync(this.container.botList.postStats());

		return result.match({
			ok: () => this.container.logger.info('[PostStats] Successfully posted stats to bot lists'),
			err: (error) => {
				throw error; // Let Sapphire listener handle it
			},
		});
	}
}
