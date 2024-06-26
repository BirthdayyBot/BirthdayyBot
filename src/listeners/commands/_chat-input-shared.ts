import { type ChatInputCommandErrorPayload } from '@sapphire/framework';
import type { ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';
import { flattenError, generateUnexpectedErrorMessage, resolveError } from './_shared.js';
import { fetchT } from '@sapphire/plugin-i18next';

export async function handleCommandError(
	error: unknown,
	payload: ChatInputCommandErrorPayload | ChatInputSubcommandErrorPayload
) {
	const { interaction } = payload;
	const t = await fetchT(interaction);
	const resolved = flattenError(payload.command, error);
	const content = resolved
		? resolveError(t, resolved)
		: generateUnexpectedErrorMessage(interaction.user.id, payload.command, t, error);

	try {
		if (interaction.replied) await interaction.followUp({ content, ephemeral: true });
		else if (interaction.deferred) await interaction.editReply({ content });
		else await interaction.reply({ content, ephemeral: true });
	} catch {}
}
