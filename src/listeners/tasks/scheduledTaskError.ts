import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import * as Sentry from '@sentry/node';
import { isExpectedDiscordError, logErrorToContainer } from '../../lib/utils/errorHandling';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskError })
export class ScheduledTaskErrorEvent extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
	public run(error: Error, task: string, _payload: unknown) {
		// Don't report expected Discord API errors to Sentry
		if (!isExpectedDiscordError(error) && envIsDefined('SENTRY_DSN')) {
			Sentry.withScope((scope) => {
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
