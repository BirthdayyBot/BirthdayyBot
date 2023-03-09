import type { Command } from '@sapphire/framework';

/**
 * @param {Command.ChatInputCommandInteraction} interaction
 * @param {boolean} isEphemeral
 */
export default async function thinking(interaction: Command.ChatInputCommandInteraction, isEphemeral = false): Promise<void> {
    if (isEphemeral) {
        // send out ephemeral thinking message
        await interaction.deferReply({ ephemeral: true });
    } else {
        // send normal thinking message
        await interaction.deferReply();
    }
}
