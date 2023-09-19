import { ApplyOptions } from '@sapphire/decorators';
import { Listener, UserError } from '@sapphire/framework';

import { interactionProblem } from '#utils/embed';
import { resolveKey } from '@sapphire/plugin-i18next';
import { SubcommandPluginEvents, type ChatInputSubcommandDeniedPayload } from '@sapphire/plugin-subcommands';

@ApplyOptions<Listener.Options>({ event: SubcommandPluginEvents.ChatInputSubCommandDenied })
export class ChatInputSubcommandErrorEvent extends Listener<typeof SubcommandPluginEvents.ChatInputSubCommandDenied> {
	public async run(
		{ context, identifier }: UserError,
		{ interaction, command, matchedSubcommandMapping }: ChatInputSubcommandDeniedPayload,
	) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), 'silent')) return;

		const commandName = `${command.name} ${matchedSubcommandMapping.name}`;

		return interactionProblem(
			interaction,
			await resolveKey(interaction, identifier, {
				commandName,
			}),
		);
	}
}
