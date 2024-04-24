import type { SlashCommandIntegerOption, SlashCommandUserOption } from '@discordjs/builders';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import dayjs from 'dayjs';

export function dayOptions(builder: SlashCommandIntegerOption, key: string) {
	return applyLocalizedBuilder(builder, `${key}Name`, `${key}Description`).setRequired(true).setMinValue(1).setMaxValue(31);
}

export function monthOptions(builder: SlashCommandIntegerOption, key: string) {
	return applyLocalizedBuilder(builder, `${key}Name`, `${key}Description`).setRequired(true).setAutocomplete(true);
}

export function yearOptions(builder: SlashCommandIntegerOption, key: string) {
	const currentYear = dayjs().year();
	const minYear = currentYear - 100;
	return applyLocalizedBuilder(builder, `${key}Name`, `${key}Description`).setMinValue(minYear).setMaxValue(currentYear).setRequired(false);
}

export function userOptions(builder: SlashCommandUserOption, key: string) {
	return applyLocalizedBuilder(builder, `${key}Name`, `${key}Description`).setRequired(false);
}
