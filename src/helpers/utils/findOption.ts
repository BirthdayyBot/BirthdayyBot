import type { Command } from '@sapphire/framework';

/**
Find an option in an interaction object
    @param {Command.ChatInputCommandInteraction} interaction - interaction object
    @param {string} option - option key
    @param {?any} defaultValue - default value - null by default
    @returns {(string | null)}
    */
export default function findOption(interaction: Command.ChatInputCommandInteraction, option: string, defaultValue: any = null) {
	if (Object.entries(interaction.options).length === 0) return defaultValue;
	const o = interaction.options.get(option);
	return o ? o.value : defaultValue;
}
