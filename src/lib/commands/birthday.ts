import { applyLocalizedBuilder, createLocalizedChoice } from '@sapphire/plugin-i18next';
import dayjs from 'dayjs';
import {
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
	SlashCommandUserOption,
	chatInputApplicationCommandMention,
} from 'discord.js';

export const BirthdayApplicationCommandMentions = {
	Register: chatInputApplicationCommandMention('birthday', 'register', '935174192389840896'),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', '935174192389840896'),
	List: chatInputApplicationCommandMention('birthday', 'list', '935174192389840896'),
	Show: chatInputApplicationCommandMention('birthday', 'show', '935174192389840896'),
	Test: chatInputApplicationCommandMention('birthday', 'test', '935174192389840896'),
	Update: chatInputApplicationCommandMention('birthday', 'update', '935174192389840896'),
} as const;

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
	return applyLocalizedBuilder(builder, 'commands/birthday:listName', 'commands/birthday:listDescription');
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

function yearOptions(option: SlashCommandIntegerOption, key: string) {
	const currentYear = dayjs().year();
	const minYear = currentYear - 100;
	return applyLocalizedBuilder(option, key).setMinValue(minYear).setMaxValue(currentYear).setRequired(false);
}

function userOptions(option: SlashCommandUserOption, key: string) {
	return applyLocalizedBuilder(option, key).setRequired(false);
}
