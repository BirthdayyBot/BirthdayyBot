import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTask, ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskError })
export class UserListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public override run(error: Error, task: ScheduledTask) {
		this.container.logger.error(`[Scheduled-Task Plugin]: task: ${task.name} threw an error`, error);
	}
}
