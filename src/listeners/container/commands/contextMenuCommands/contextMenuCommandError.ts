import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ContextMenuCommandErrorPayload } from '@sapphire/framework';
import { handleCommandErrorAndSendToUser } from '#utils/functions/errorHandling';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandError })
export class ContextMenuCommandErrorEvent extends Listener<typeof Events.ContextMenuCommandError> {
	public run(error: Error, payload: ContextMenuCommandErrorPayload) {
		return handleCommandErrorAndSendToUser({
			error,
			interaction: payload.interaction,
			loggerSeverityLevel: 'error',
			sentrySeverityLevel: 'error',
		});
	}
}
