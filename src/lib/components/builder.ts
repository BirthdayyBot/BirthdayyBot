import { applyLocalizedBuilder, createLocalizedChoice } from '@sapphire/plugin-i18next';
import dayjs from 'dayjs';
import type { SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandUserOption } from '@discordjs/builders';

export function dayOptions(option: SlashCommandIntegerOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(true).setMinValue(1).setMaxValue(31);
}

export function monthOptions(option: SlashCommandStringOption, key: string) {
	return applyLocalizedBuilder(option, key)
		.setRequired(true)
		.addChoices(
			createLocalizedChoice('month:january', { value: '01' }),
			createLocalizedChoice('month:february', { value: '02' }),
			createLocalizedChoice('month:february', { value: '03' }),
			createLocalizedChoice('month:april', { value: '04' }),
			createLocalizedChoice('month:may', { value: '05' }),
			createLocalizedChoice('month:june', { value: '06' }),
			createLocalizedChoice('month:july', { value: '07' }),
			createLocalizedChoice('month:august', { value: '08' }),
			createLocalizedChoice('month:september', { value: '09' }),
			createLocalizedChoice('month:october', { value: '10' }),
			createLocalizedChoice('month:november', { value: '11' }),
			createLocalizedChoice('month:december', { value: '12' }),
		);
}

export function yearOptions(option: SlashCommandIntegerOption, key: string) {
	const currentYear = dayjs().year();
	const minYear = currentYear - 100;
	return applyLocalizedBuilder(option, key).setMinValue(minYear).setMaxValue(currentYear).setRequired(false);
}

export function userOptions(option: SlashCommandUserOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(false);
}
