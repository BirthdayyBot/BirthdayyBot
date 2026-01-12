import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import {
	SubcommandPluginEvents,
	type ChatInputSubcommandAcceptedPayload,
	type SubcommandMappingMethod,
} from '@sapphire/plugin-subcommands';
import type { CacheType, Interaction } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: SubcommandPluginEvents.SubcommandMappingIsMissingChatInputCommandHandler })
export class ChatInputSubcommandErrorEvent extends Listener<
	typeof SubcommandPluginEvents.SubcommandMappingIsMissingChatInputCommandHandler
> {
	public run(
		_message: Interaction<CacheType>,
		subcommand: SubcommandMappingMethod,
		payload: ChatInputSubcommandAcceptedPayload,
	) {
		const error = new Error(`Subcommand mapping is missing chat input command handler for ${subcommand.name}`);
		return container.errorLogger.handle(error, {
			logSeverity: 'error',
			interaction: payload.interaction,
		});
	}
}
