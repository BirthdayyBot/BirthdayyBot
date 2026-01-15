import { ApplyOptions } from '@sapphire/decorators';
import { Listener, container } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import { isBaseError } from '../../lib/errors/index';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskError })
export class ScheduledTaskErrorListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public run(error: Error, task: string, _payload: unknown) {
		const normalizedError = this.container.errorLogger.handle(error, {
			taskName: task,
			logSeverity: 'error',
		});

		// Log detailed info for tasks
		if (isBaseError(normalizedError)) {
			container.logger.debug(`Task "${task}" failed with ${normalizedError.code}: ${normalizedError.message}`);
		}
	}
}
