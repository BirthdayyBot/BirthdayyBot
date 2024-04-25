import type { ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';

import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { type ChatInputCommandErrorPayload } from '@sapphire/framework';

import { Colors, EmbedBuilder } from 'discord.js';
import { flattenError, generateUnexpectedErrorMessage, resolveError } from './_shared.js';

export async function handleCommandError(error: unknown, payload: ChatInputCommandErrorPayload | ChatInputSubcommandErrorPayload) {
	const { interaction } = payload;
	const t = getSupportedUserLanguageT(interaction);
	const resolved = flattenError(payload.command, error);
	const content = resolved ? resolveError(t, resolved) : generateUnexpectedErrorMessage(interaction.user.id, payload.command, t, error);
	const embed = new EmbedBuilder().setColor(Colors.Red).setDescription(content);

	try {
		if (interaction.replied) await interaction.followUp({ embeds: [embed], ephemeral: true });
		else if (interaction.deferred) await interaction.editReply({ embeds: [embed] });
		else await interaction.reply({ embeds: [embed], ephemeral: true });
	} catch {}
}
