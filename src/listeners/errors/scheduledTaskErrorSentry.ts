import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import { captureException } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions({ enabled: envIsDefined('SENTRY_URL'), event: ScheduledTaskEvents.ScheduledTaskError })
export class UserListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public run(error: Error, task: string, _payload: unknown) {
		captureException(error, { tags: { name: task } });
	}
}
