import type { Command } from '@sapphire/framework';

/**
 * @param interaction - The interaction object that was passed to your command handler.
 * @param isEphemeral - Whether the thinking message should be ephemeral or not.
 */
export default async function thinking(
	interaction: Command.ChatInputCommandInteraction,
	isEphemeral = false,
): Promise<void> {
	if (isEphemeral) {
		// send out ephemeral thinking message
		await interaction.deferReply({ ephemeral: true });
	} else {
		// send normal thinking message
		await interaction.deferReply();
	}
}
