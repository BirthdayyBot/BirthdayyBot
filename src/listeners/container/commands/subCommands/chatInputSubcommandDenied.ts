import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { handleCommandErrorAndSendToUser } from '../../../../lib/utils/errorHandling';

import { ChatInputSubcommandErrorPayload, SubcommandPluginEvents } from '@sapphire/plugin-subcommands';

@ApplyOptions<Listener.Options>({ event: SubcommandPluginEvents.ChatInputSubcommandError })
export class ChatInputSubcommandErrorEvent extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandError> {
	public run(error: Error, payload: ChatInputSubcommandErrorPayload) {
		return handleCommandErrorAndSendToUser({
			error,
			interaction: payload.interaction,
			loggerSeverityLevel: 'error',
			sentrySeverityLevel: 'error',
		});
	}
}
