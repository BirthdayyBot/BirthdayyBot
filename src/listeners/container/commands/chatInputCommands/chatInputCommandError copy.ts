import { ApplyOptions } from '@sapphire/decorators';
import {
	SubcommandPluginEvents,
	type ChatInputSubcommandSuccessPayload,
	type ChatInputCommandSubcommandMappingMethod,
} from '@sapphire/plugin-subcommands';
import { Listener, type ChatInputCommand, container } from '@sapphire/framework';
import { getSuccessLoggerData } from '../../../../helpers';

@ApplyOptions<Listener.Options>({ event: SubcommandPluginEvents.ChatInputSubcommandSuccess })
export class ChatInputCommandErrorEvent extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandSuccess> {
	public run(
		interaction: ChatInputCommand.Interaction,
		subcommand: ChatInputCommandSubcommandMappingMethod,
		payload: ChatInputSubcommandSuccessPayload,
	) {
		const successLoggerData = getSuccessLoggerData(interaction.guild, interaction.user, payload.command);

		return container.logger.debug(
			`${successLoggerData.shard} - ${successLoggerData.commandName}(${subcommand.name}) ${successLoggerData.author} ${successLoggerData.sentAt}`,
		);
	}
}
