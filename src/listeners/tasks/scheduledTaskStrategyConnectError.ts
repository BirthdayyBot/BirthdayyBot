import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks';
import { envIsDefined } from '@skyra/env-utilities';
import { logErrorToContainer } from '#utils/functions/errorHandling';
import { captureException, withScope } from '@sentry/node';

@ApplyOptions<Listener.Options>({ event: ScheduledTaskEvents.ScheduledTaskStrategyConnectError })
export class ScheduledTaskStrategyConnectErrorEvent extends Listener<
	typeof ScheduledTaskEvents.ScheduledTaskStrategyConnectError
> {
	public run(error: Error) {
		if (envIsDefined('SENTRY_DSN')) {
			withScope((scope) => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('ScheduledTaskStrategyConnectErrorEvent');
				captureException(error);
			});
		}

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
