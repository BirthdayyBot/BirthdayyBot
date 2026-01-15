import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerErrorPayload } from '@sapphire/framework';

/**
 * Handle errors from event listeners
 */
@ApplyOptions<Listener.Options>({ event: Events.ListenerError })
export class ListenerErrorListener extends Listener<typeof Events.ListenerError> {
	public run(error: Error, _payload: ListenerErrorPayload) {
		return this.container.errorLogger.handle(error, {
			logSeverity: 'error',
		});
	}
}
