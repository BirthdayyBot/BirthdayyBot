import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import { SENTRY_DSN } from '../../helpers/provide/environment';
import * as Sentry from '@sentry/node';
import { logErrorToContainer } from '../../lib/utils/errorHandling';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskStrategyConnectError })
export class ScheduledTaskStrategyConnectErrorEvent extends Listener<typeof ScheduledTaskEvents.ScheduledTaskStrategyConnectError> {
	public run(error: Error) {
		if (SENTRY_DSN) {
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
