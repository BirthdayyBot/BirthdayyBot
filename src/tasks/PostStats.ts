import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { ApplyOptions } from '@sapphire/decorators';
import { isPrd } from '../helpers/provide/environment';

@ApplyOptions<ScheduledTask.Options>({
	name: 'PostStats',
	enabled: isPrd,
	pattern: '0 * * * *',
})
export class PostStats extends ScheduledTask {
	public run() {
		if (!isPrd) return;
		return this.container.botList.postStats();
	}
}
