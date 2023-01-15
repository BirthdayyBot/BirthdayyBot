import type { Command } from '@sapphire/framework';

export default function findOption(interaction: Command.ChatInputCommandInteraction, option: string) {
	const o = interaction.options.get(option);
	return o ? o.value : null;
}
