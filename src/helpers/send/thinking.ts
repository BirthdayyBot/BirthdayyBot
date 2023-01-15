import type { Command } from '@sapphire/framework';

/**
 * @param {Command.ChatInputCommandInteraction} interaction
 * @param {boolean} isEphemeral
 */
module.exports = async (interaction: Command.ChatInputCommandInteraction, isEphemeral: boolean) => {
	if (isEphemeral) {
		//send out ephemeral thinking message
		await interaction.deferReply({ ephemeral: true });
	} else {
		//send normal thinking message
		await interaction.deferReply();
	}
};
