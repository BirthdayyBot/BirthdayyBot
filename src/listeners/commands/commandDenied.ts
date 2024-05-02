import {
	ChatInputCommandDeniedPayload,
	ContextMenuCommandDeniedPayload,
	Events,
	Listener,
	UserError
} from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import type { CommandInteraction } from 'discord.js';

export class UserChatInputListener extends Listener<typeof Events.ChatInputCommandDenied> {
	public async run({ context, identifier }: UserError, { interaction, command }: ChatInputCommandDeniedPayload) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), 'silent')) return;

		return this.alert(
			interaction,
			await resolveKey(interaction, identifier, {
				interaction,
				command,
				...(context as any as Record<string, unknown>)
			})
		);
	}

	private alert(interaction: CommandInteraction, content: string) {
		return interaction.reply({ content, ephemeral: true });
	}
}

export class UserContextMenuListener extends Listener<typeof Events.ContextMenuCommandDenied> {
	public async run({ context, identifier }: UserError, { interaction, command }: ContextMenuCommandDeniedPayload) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(context), 'silent')) return;

		return this.alert(
			interaction,
			await resolveKey(interaction, identifier, {
				interaction,
				command,
				...(context as any as Record<string, unknown>)
			})
		);
	}

	private alert(interaction: CommandInteraction, content: string) {
		return interaction.reply({ content, ephemeral: true });
	}
}
