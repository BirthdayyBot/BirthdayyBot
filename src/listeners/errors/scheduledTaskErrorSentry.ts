import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents, type ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { captureException } from '@sentry/node';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskError })
export class UserListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public override run(error: Error, task: ScheduledTask) {
		captureException(error, { tags: { name: task.name } });
	}
}
