import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import { captureException, withScope } from '@sentry/node';
import { envIsDefined } from '@skyra/env-utilities';
import { logErrorToContainer } from '../../lib/utils/functions/errorHandling';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskError })
export class ScheduledTaskErrorEvent extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public run(error: Error, task: string, _payload: unknown) {
		if (envIsDefined('SENTRY_DSN')) {
			withScope((scope) => {
				scope.setLevel('error');
				scope.setTags({ task });
				scope.setFingerprint([error.name]);
				scope.setTransactionName('ScheduledTaskErrorEvent');
				captureException(error);
			});
		}

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
