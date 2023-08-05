import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import dayjs from 'dayjs';
import {
	PermissionFlagsBits,
	type SlashCommandBuilder,
	type SlashCommandIntegerOption,
	type SlashCommandStringOption,
	type SlashCommandSubcommandBuilder,
	type SlashCommandUserOption,
} from 'discord.js';

export function birthdayCommand(builder: SlashCommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:birthday')
		.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
		.setDMPermission(false);
}

export function registerBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:register')
		.addIntegerOption((option) => dayOptions(option, 'commands/birthday:register.day'))
		.addStringOption((option) => monthOptions(option, 'commands/birthday:register.month'))
		.addIntegerOption((option) => yearOptions(option, 'commands/birthday:register.year'))
		.addUserOption((option) => userOptions(option, 'commands/birthday:register.user'));
}

export function listBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:list');
}

export function removeBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:remove').addUserOption((option) =>
		userOptions(option, 'commands/birthday:remove.user'),
	);
}

export function updateBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:update')
		.addIntegerOption((option) => dayOptions(option, 'commands/birthday:update.day'))
		.addStringOption((option) => monthOptions(option, 'commands/birthday:update.month'))
		.addIntegerOption((option) => yearOptions(option, 'commands/birthday:update.year'))
		.addUserOption((option) => userOptions(option, 'commands/birthday:update.user'));
}

export function showBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:show').addUserOption((option) =>
		userOptions(option, 'commands/birthday:show.user'),
	);
}

export function testBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:test').addUserOption((option) =>
		userOptions(option, 'commands/birthday:test.user'),
	);
}

function dayOptions(option: SlashCommandIntegerOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(true).setMinValue(1).setMaxValue(31);
}

function monthOptions(option: SlashCommandStringOption, key: string) {
	return applyLocalizedBuilder(option, key)
		.setRequired(true)
		.addChoices(...monthChoices);
}

function yearOptions(option: SlashCommandIntegerOption, key: string) {
	const currentYear = dayjs().year();
	const minYear = currentYear - 100;
	return applyLocalizedBuilder(option, key).setMinValue(minYear).setMaxValue(currentYear).setRequired(false);
}

function userOptions(option: SlashCommandUserOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(false);
}

const monthChoices = [
	{
		name: 'January | 1',
		value: '01',
	},
	{
		name: 'February | 2',
		value: '02',
	},
	{
		name: 'March | 3',
		value: '03',
	},
	{
		name: 'April | 4',
		value: '04',
	},
	{
		name: 'May | 5',
		value: '05',
	},
	{
		name: 'June | 6',
		value: '06',
	},
	{
		name: 'July | 7',
		value: '07',
	},
	{
		name: 'August | 8',
		value: '08',
	},
	{
		name: 'September | 9',
		value: '09',
	},
	{
		name: 'October | 10',
		value: '10',
	},
	{
		name: 'November | 11',
		value: '11',
	},
	{
		name: 'December | 12',
		value: '12',
	},
] as const;
