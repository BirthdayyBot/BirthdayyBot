import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import * as Sentry from '@sentry/node';
import { logErrorToContainer } from '../../lib/utils/errorHandling';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskStrategyConnectError })
export class ScheduledTaskStrategyConnectErrorEvent extends Listener<
	typeof ScheduledTaskEvents.ScheduledTaskStrategyConnectError
> {
	public run(error: Error) {
		if (envIsDefined('SENTRY_DSN')) {
			Sentry.withScope((scope) => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('ScheduledTaskStrategyConnectErrorEvent');
				Sentry.captureException(error);
			});
		}

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
