import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { handleCommandErrorAndSendToUser } from '../../../../lib/utils/functions/errorHandling';

import { SubcommandPluginEvents, type ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';

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
