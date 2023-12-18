import { isProduction } from '#utils/env';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Result } from '@sapphire/result';

@ApplyOptions<ScheduledTask.Options>({
	name: 'PostStats',
	enabled: isProduction,
	pattern: '0 * * * *',
})
export class PostStats extends ScheduledTask {
	public async run() {
		if (!isProduction) return container.logger.error('PostStats task is disabled.');
		const result = await Result.fromAsync(container.botList.postStats());

		return result.match({
			ok: () => container.logger.info('Successfully posted stats to bot lists.'),
			err: (error) => container.logger.error('[PostStatsError]', error),
		});
	}
}
