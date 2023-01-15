import type { Command } from '@sapphire/framework';

export default function findOption(interaction: Command.ChatInputCommandInteraction, option: string) {
	if (Object.entries(interaction.options).length === 0) return null;
	const o = interaction.options.get(option);
	return o ? o.value : null;
}
