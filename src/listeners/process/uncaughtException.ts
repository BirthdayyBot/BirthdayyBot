import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { SENTRY_DSN } from '../../helpers/provide/environment';
import * as Sentry from '@sentry/node';

@ApplyOptions<Listener.Options>({ emitter: process, event: 'uncaughtException' })
export class UserEvent extends Listener {

	public async run(error: Error) {
		if (SENTRY_DSN) Sentry.captureException(error, { level: 'error' });
		this.container.logger.error(error);
	}
}