import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { formatDateForDisplay, getDateFromInteraction, numberToMonthName } from '#utils/common';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { getBirthdays } from '#utils/functions';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import type { Birthday } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum, Result } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { isNullOrUndefined } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import dayjs from 'dayjs';
import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandUserOption,
	User,
	bold,
	chatInputApplicationCommandMention
} from 'discord.js';

@ApplyOptions<BirthdayySubcommand.Options>({
	subcommands: [
		{ name: 'list', chatInputRun: 'chatInputRunList' },
		{ name: 'set', chatInputRun: 'chatInputRunSet' },
		{ name: 'remove', chatInputRun: 'chatInputRunRemove' },
		{ name: 'show', chatInputRun: 'chatInputRunShow' }
	],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Everyone
})
export class UserCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			this.registerSubcommands(
				applyDescriptionLocalizedBuilder(builder, 'commands/birthday:rootDescription') //
					.setName('birthday')
					.setDMPermission(false)
			)
		);
	}

	public async chatInputRunList(interaction: ChatInputCommandInteraction<'cached'>) {
		const birthdayManager = getBirthdays(interaction.guild);
		await getBirthdays(interaction.guild).fetch();
		const month = interaction.options.getInteger('month') ?? dayjs().month() + 1;

		const birthdays = month ? birthdayManager.findBirthdayWithMonth(month) : birthdayManager.findTeenNextBirthday();

		const options = { month: numberToMonthName(Number(month)), context: month ? 'month' : '' };

		const title = await resolveKey(interaction, 'commands/birthday:listTitle', options);

		return birthdayManager.sendPaginatedBirthdays(interaction, birthdays, title);
	}

	public async chatInputRunSet(interaction: ChatInputCommandInteraction<'cached'>) {
		const birthday = getDateFromInteraction(interaction);
		const newBirthday = await getBirthdays(interaction.guildId).upsert({ birthday, userId: interaction.user.id });

		if (isNullOrUndefined(newBirthday)) return this.handleSetFailure(interaction);
		return this.handleSetSuccess(interaction, newBirthday);
	}

	public async chatInputRunRemove(interaction: ChatInputCommandInteraction<'cached'>) {
		const { user } = interaction;
		const result = await getBirthdays(interaction.guildId).remove(user.id);

		if (isNullOrUndefined(result)) return this.handleRemoveFailure(interaction);
		return this.handleRemoveSuccess(interaction);
	}

	public async chatInputRunShow(interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const isSelf = user.id === interaction.user.id;

		const result = await Result.fromAsync(await getBirthdays(interaction.guild).fetch(user.id));

		return result.match({
			ok: (birthday) => {
				if (isSelf) return this.handleShowSelfBirthday(interaction, birthday);
				return this.handleShowBirthday(interaction, birthday, user);
			},
			err: () => {
				if (isSelf) return this.handleShowSelfNoBirthday(interaction, user);
				return this.handleShowNoBirthday(interaction, user);
			}
		});
	}

	private async handleSetSuccess(interaction: ChatInputCommandInteraction<'cached'>, birthday: Birthday) {
		const content = await resolveKey(interaction, 'commands/birthday:setSuccess', {
			birthday: formatDateForDisplay(birthday.birthday)
		});
		return interaction.reply(interactionSuccess(content));
	}

	private async handleSetFailure(interaction: ChatInputCommandInteraction<'cached'>) {
		const content = await resolveKey(interaction, 'commands/birthday:setFailure');
		return interaction.reply(interactionProblem(content));
	}

	private async handleShowSelfBirthday(interaction: ChatInputCommandInteraction<'cached'>, birthday: Birthday) {
		const content = await resolveKey(interaction, 'commands/birthday:showSelf', {
			birthday: bold(formatDateForDisplay(birthday.birthday))
		});
		return interaction.reply(interactionSuccess(content));
	}

	private async handleShowBirthday(
		interaction: ChatInputCommandInteraction<'cached'>,
		birthday: Birthday,
		user: User
	) {
		const content = await resolveKey(interaction, 'commands/birthday:showBirthday', {
			user,
			birthday: bold(formatDateForDisplay(birthday.birthday))
		});
		return interaction.reply(interactionSuccess(content));
	}

	private async handleShowSelfNoBirthday(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
		const content = await resolveKey(interaction, 'commands/birthday:showSelfNoBirthday', { user });
		return interaction.reply(interactionProblem(content));
	}

	private async handleShowNoBirthday(interaction: ChatInputCommandInteraction<'cached'>, user: User) {
		const content = await resolveKey(interaction, 'commands/birthday:showNoBirthday', { user });
		return interaction.reply(interactionProblem(content));
	}

	private async handleRemoveSuccess(interaction: ChatInputCommandInteraction<'cached'>) {
		const content = await resolveKey(interaction, 'commands/birthday:remove.success');
		return interaction.reply(interactionSuccess(content));
	}

	private async handleRemoveFailure(interaction: ChatInputCommandInteraction<'cached'>) {
		const content = await resolveKey(interaction, 'commands/birthday:remove.notRegistered');
		return interaction.reply(interactionProblem(content));
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return builder
			.addSubcommand((subcommand) => this.registerSetSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerRemoveSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerListSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerShowSubCommand(subcommand));
	}

	private registerSetSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:setDescription')
			.setName('set')
			.addIntegerOption((option) => UserCommand.dayOptions(option, 'commands/birthday:setOptionsDayDescription'))
			.addIntegerOption((option) =>
				UserCommand.monthOptions(option, 'commands/birthday:setOptionsMonthDescription')
			)
			.addIntegerOption((option) =>
				UserCommand.yearOptions(option, 'commands/birthday:setOptionsYearDescription')
			);
	}

	private registerListSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:listDescription')
			.setName('list')
			.addIntegerOption((option) =>
				UserCommand.monthOptions(option, 'commands/birthday:listOptionsMonthDescription').setRequired(false)
			);
	}

	private registerRemoveSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:removeDescription').setName('remove');
	}

	private registerShowSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:showDescription')
			.setName('show')
			.addUserOption((option) => UserCommand.userOptions(option, 'commands/birthday:showOptionsUserDescription'));
	}

	public static dayOptions(option: SlashCommandIntegerOption, key: string) {
		return applyLocalizedBuilder(option, key).setRequired(true).setMinValue(1).setMaxValue(31);
	}

	public static monthOptions(option: SlashCommandIntegerOption, key: string) {
		return applyLocalizedBuilder(option, key).setRequired(true).setAutocomplete(true);
	}

	public static yearOptions(option: SlashCommandIntegerOption, key: string) {
		const currentYear = dayjs().year();
		const minYear = currentYear - 100;
		return applyLocalizedBuilder(option, key).setMinValue(minYear).setMaxValue(currentYear).setRequired(false);
	}

	public static userOptions(option: SlashCommandUserOption, key: string) {
		return applyLocalizedBuilder(option, key).setRequired(false);
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', envParseString('COMMANDS_BIRTHDAY_ID')),
	Set: chatInputApplicationCommandMention('birthday', 'set', envParseString('COMMANDS_BIRTHDAY_ID')),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', envParseString('COMMANDS_BIRTHDAY_ID')),
	Show: chatInputApplicationCommandMention('birthday', 'show', envParseString('COMMANDS_BIRTHDAY_ID')),
	Test: chatInputApplicationCommandMention('birthday', 'test', envParseString('COMMANDS_BIRTHDAY_ID'))
} as const;
