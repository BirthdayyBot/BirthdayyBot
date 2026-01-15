import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, type ContextMenuCommandErrorPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandError })
export class ContextMenuCommandErrorEvent extends Listener<typeof Events.ContextMenuCommandError> {
	public run(error: Error, payload: ContextMenuCommandErrorPayload) {
		return container.errorLogger.handle(error, {
			logSeverity: 'error',
			interaction: payload.interaction,
		});
	}
}
