import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Result } from '@sapphire/result';
import { IS_CUSTOM_BOT } from '../helpers';
import { isProduction } from '../lib/utils/env';

@ApplyOptions<ScheduledTask.Options>({
	name: 'PostStats',
	enabled: isProduction,
	pattern: '0 * * * *',
})
export class PostStats extends ScheduledTask {
	public async run() {
		if (!isProduction || IS_CUSTOM_BOT) return;
		const result = await Result.fromAsync(this.container.botList.postStats());

		return result.match({
			ok: () => this.container.logger.info('Successfully posted stats to bot lists.'),
			err: (error) => this.container.logger.error('[PostStatsError]', error),
		});
	}
}
