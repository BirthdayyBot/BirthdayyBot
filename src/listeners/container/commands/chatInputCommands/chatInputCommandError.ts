import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ChatInputCommandErrorPayload } from '@sapphire/framework';
import { handleCommandErrorAndSendToUser } from '../../../../lib/utils/errorHandling';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandError })
export class ChatInputCommandErrorEvent extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: Error, payload: ChatInputCommandErrorPayload) {
		return handleCommandErrorAndSendToUser({
			error,
			interaction: payload.interaction,
			loggerSeverityLevel: 'error',
			sentrySeverityLevel: 'error',
		});
	}
}
