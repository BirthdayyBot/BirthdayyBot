import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import {
	SubcommandPluginEvents,
	type ChatInputSubcommandAcceptedPayload,
	type SubcommandMappingMethod,
} from '@sapphire/plugin-subcommands';
import type { CacheType, Interaction } from 'discord.js';
import { handleCommandErrorAndSendToUser } from '../../../../lib/utils/functions/errorHandling';

@ApplyOptions<Listener.Options>({ event: SubcommandPluginEvents.SubcommandMappingIsMissingChatInputCommandHandler })
export class ChatInputSubcommandErrorEvent extends Listener<
	typeof SubcommandPluginEvents.SubcommandMappingIsMissingChatInputCommandHandler
> {
	public run(
		_message: Interaction<CacheType>,
		subcommand: SubcommandMappingMethod,
		payload: ChatInputSubcommandAcceptedPayload,
	) {
		return handleCommandErrorAndSendToUser({
			error: new Error(`Subcommand mapping is missing chat input command handler for ${subcommand.name}`),
			interaction: payload.interaction,
			loggerSeverityLevel: 'error',
			sentrySeverityLevel: 'error',
		});
	}
}
