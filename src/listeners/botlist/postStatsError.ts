import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { logErrorToContainer } from '../../lib/utils/errorHandling';
import { envIsDefined } from '@skyra/env-utilities';

@ApplyOptions<Listener.Options>({ emitter: container.botList, event: 'postStatsError' })
export class postStatsErrorEvent extends Listener<typeof Events.Error> {
	public run(error: Error) {
		const SendErrorToSentry = () =>
			Sentry.withScope((scope) => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('postStatsErrorEvent');
				Sentry.captureException(error);
			});

		if (envIsDefined('SENTRY_DSN')) return SendErrorToSentry;

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
