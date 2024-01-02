import type { SlashCommandIntegerOption, SlashCommandUserOption } from '@discordjs/builders';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import dayjs from 'dayjs';

export function dayOptions(option: SlashCommandIntegerOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(true).setMinValue(1).setMaxValue(31);
}

export function monthOptions(option: SlashCommandIntegerOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(true).setAutocomplete(true);
}

export function yearOptions(option: SlashCommandIntegerOption, key: string) {
	const currentYear = dayjs().year();
	const minYear = currentYear - 100;
	return applyLocalizedBuilder(option, key).setMinValue(minYear).setMaxValue(currentYear).setRequired(false);
}

export function userOptions(option: SlashCommandUserOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(false);
}
