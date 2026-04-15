import { Month } from '#utils/birthday/types';
import { applyDescriptionLocalizedBuilder, createLocalizedChoice } from '@sapphire/plugin-i18next';
import { SlashCommandIntegerOption, SlashCommandUserOption } from 'discord.js';

const minYear = 1900;
const maxYear = new Date().getFullYear();

export function registerDayOption(option: SlashCommandIntegerOption, key: string) {
	return applyDescriptionLocalizedBuilder(option.setName('day'), key)
		.setRequired(true)
		.setMinValue(1)
		.setMaxValue(31);
}

const localizedMonthChoices = [
	createLocalizedChoice('globals:months.0', { value: Month.January }),
	createLocalizedChoice('globals:months.1', { value: Month.February }),
	createLocalizedChoice('globals:months.2', { value: Month.March }),
	createLocalizedChoice('globals:months.3', { value: Month.April }),
	createLocalizedChoice('globals:months.4', { value: Month.May }),
	createLocalizedChoice('globals:months.5', { value: Month.June }),
	createLocalizedChoice('globals:months.6', { value: Month.July }),
	createLocalizedChoice('globals:months.7', { value: Month.August }),
	createLocalizedChoice('globals:months.8', { value: Month.September }),
	createLocalizedChoice('globals:months.9', { value: Month.October }),
	createLocalizedChoice('globals:months.10', { value: Month.November }),
	createLocalizedChoice('globals:months.11', { value: Month.December })
];

export function registerMonthOption(option: SlashCommandIntegerOption, key: string) {
	return applyDescriptionLocalizedBuilder(option.setName('month'), key)
		.setRequired(true)
		.setChoices(localizedMonthChoices);
}

export function registerYearOption(option: SlashCommandIntegerOption, key: string) {
	return applyDescriptionLocalizedBuilder(option.setName('year'), key)
		.setRequired(false)
		.setMinValue(minYear)
		.setMaxValue(maxYear);
}

export function registerUserOption(option: SlashCommandUserOption, key: string) {
	return applyDescriptionLocalizedBuilder(option.setName('user'), key);
}

export function registerUserRequiredOption(option: SlashCommandUserOption, key: string) {
	return registerUserOption(option, key).setRequired(true);
}
