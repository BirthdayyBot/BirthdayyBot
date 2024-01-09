import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<ScheduledTask.Options>({ name: 'SyncResourceAnalytics', pattern: '*/1 * * * *' })
export class UserTask extends ScheduledTask {
	public run() {
		this.container.client.emit(Events.ResourceAnalyticsSync);
		return null;
	}
}
