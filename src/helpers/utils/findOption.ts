import type { Command } from '@sapphire/framework';

/**
Find an option in an interaction object
    @param interaction - interaction object
    @param option - option key
    @param defaultValue - default value - null by default
    @returns the value of the option or the default value
    */
export default function findOption<t>(
	interaction: Command.ChatInputCommandInteraction,
	option: string,
	defaultValue: t,
) {
	return (interaction.options.get(option)?.value as t) ?? defaultValue;
}
