import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import { SENTRY_DSN } from '../../helpers/provide/environment';
import * as Sentry from '@sentry/node';
import { logErrorToContainer } from '../../lib/utils/errorHandling';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskError })
export class ScheduledTaskErrorEvent extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public run(error: Error, task: string, _duration: number, _payload: any) {
		if (SENTRY_DSN) {
			Sentry.withScope(scope => {
				scope.setLevel('error');
				scope.setTags({ task });
				scope.setFingerprint([error.name]);
				scope.setTransactionName('ScheduledTaskErrorEvent');
				Sentry.captureException(error);
			});
		}

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
