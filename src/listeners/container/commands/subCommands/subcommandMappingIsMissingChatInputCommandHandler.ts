import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { handleCommandErrorAndSendToUser } from '../../../../lib/utils/errorHandling';

import { ChatInputSubcommandAcceptedPayload, SubcommandMappingMethod, SubcommandPluginEvents } from '@sapphire/plugin-subcommands';
import type { CacheType, Interaction } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: SubcommandPluginEvents.SubcommandMappingIsMissingChatInputCommandHandler })
export class ChatInputSubcommandErrorEvent extends Listener<typeof SubcommandPluginEvents.SubcommandMappingIsMissingChatInputCommandHandler> {
	public run(message: Interaction<CacheType>, subcommand: SubcommandMappingMethod, payload: ChatInputSubcommandAcceptedPayload) {
		return handleCommandErrorAndSendToUser({
			error: new Error(`Subcommand mapping is missing chat input command handler for ${subcommand.name}`),
			interaction: payload.interaction, loggerSeverityLevel: 'error', sentrySeverityLevel: 'error',
		});
	}
}
