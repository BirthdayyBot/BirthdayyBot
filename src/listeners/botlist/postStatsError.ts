import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import * as Sentry from '@sentry/node';
import { logErrorToContainer } from '#utils/functions/errorHandling';
import { envIsDefined } from '@skyra/env-utilities';
import { Events } from '#lib/types/Enums';

@ApplyOptions<Listener.Options>({ emitter: container.botList, event: Events.PostStatsError })
export class postStatsErrorEvent extends Listener {
	public run(error: Error) {
		const SendErrorToSentry = () =>
			Sentry.withScope((scope) => {
				scope.setLevel('error');
				scope.setFingerprint([error.name]);
				scope.setTransactionName('postStatsErrorEvent');
				Sentry.captureException(error);
			});

		if (envIsDefined('SENTRY_URL')) return SendErrorToSentry;

		return logErrorToContainer({ error, loggerSeverityLevel: 'error' });
	}
}
