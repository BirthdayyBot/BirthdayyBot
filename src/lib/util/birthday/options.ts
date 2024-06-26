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
	createLocalizedChoice('months:January', { value: Month.January }),
	createLocalizedChoice('months:February', { value: Month.February }),
	createLocalizedChoice('months:March', { value: Month.March }),
	createLocalizedChoice('months:Apr', { value: Month.April }),
	createLocalizedChoice('months:May', { value: Month.May }),
	createLocalizedChoice('months:June', { value: Month.June }),
	createLocalizedChoice('months:July', { value: Month.July }),
	createLocalizedChoice('months:August', { value: Month.August }),
	createLocalizedChoice('months:September', { value: Month.September }),
	createLocalizedChoice('months:October', { value: Month.October }),
	createLocalizedChoice('months:November', { value: Month.November }),
	createLocalizedChoice('months:December', { value: Month.December })
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
