import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, type ChatInputCommandErrorPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandError })
export class ChatInputCommandErrorEvent extends Listener<typeof Events.ChatInputCommandError> {
	public run(error: Error, payload: ChatInputCommandErrorPayload) {
		return container.errorLogger.handle(error, {
			logSeverity: 'error',
			interaction: payload.interaction,
		});
	}
}
