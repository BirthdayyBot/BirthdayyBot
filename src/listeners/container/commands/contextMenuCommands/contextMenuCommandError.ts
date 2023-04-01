import { ApplyOptions } from '@sapphire/decorators';
import { ContextMenuCommandErrorPayload, Events, Listener } from '@sapphire/framework';
import { handleCommandErrorAndSendToUser } from '../../../../lib/utils/errorHandling';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandError })
export class ContextMenuCommandErrorEvent extends Listener<typeof Events.ContextMenuCommandError> {
	public run(error: Error, payload: ContextMenuCommandErrorPayload) {
		return handleCommandErrorAndSendToUser({
			error,
			interaction: payload.interaction,
			loggerSeverityLevel: 'error',
			sentrySeverityLevel: 'error'
		});
	}
}
