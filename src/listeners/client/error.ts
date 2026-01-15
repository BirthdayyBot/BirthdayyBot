import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener } from '@sapphire/framework';

/**
 * Global error listener for uncaught exceptions
 */
@ApplyOptions<Listener.Options>({ event: Events.Error })
export class GlobalErrorListener extends Listener<typeof Events.Error> {
	public run(error: Error) {
		container.errorLogger.handle(error, {
			logSeverity: 'error',
		});
	}
}
