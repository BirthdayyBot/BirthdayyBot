import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { addZeroToSingleDigitNumber, formatDateForDisplay, numberToMonthName } from '#utils/common';
import { Emojis } from '#utils/constants';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { getBirthdays } from '#utils/functions';
import { resolveTarget } from '#utils/utils';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { isNullOrUndefined, objectValues } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import dayjs from 'dayjs';
import {
	bold,
	chatInputApplicationCommandMention,
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandUserOption
} from 'discord.js';

@ApplyOptions<BirthdayySubcommand.Options>({
	subcommands: [
		{ name: 'list', chatInputRun: 'chatInputRunList' },
		{ name: 'set', chatInputRun: 'chatInputRunSet' },
		{ name: 'remove', chatInputRun: 'chatInputRunRemove' },
		{ name: 'show', chatInputRun: 'chatInputRunShow' },
		{ name: 'test', chatInputRun: 'chatInputRunTest', preconditions: ['Moderator'] }
	],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Everyone
})
export class BirthdayCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			this.registerSubcommands(
				applyDescriptionLocalizedBuilder(builder, 'commands/birthday:birthdayDescription') //
					.setName('birthday')
					.setDMPermission(false)
			)
		);
	}

	public async chatInputRunList(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const birthdayManager = getBirthdays(interaction.guild);
		await getBirthdays(interaction.guild).fetch();
		const month = interaction.options.getInteger('month');

		const birthdays = month ? birthdayManager.findBirthdayWithMonth(month) : birthdayManager.findTeenNextBirthday();

		const options = { month: numberToMonthName(Number(month)), context: month ? 'month' : '' };

		const title = month
			? await resolveKey(interaction, 'commands/birthday:list.title.month', options)
			: await resolveKey(interaction, 'commands/birthday:list.title.next');

		return birthdayManager.sendListBirthdays(interaction, birthdays, title);
	}

	public async chatInputRunSet(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const { options, user } = resolveTarget(interaction);
		const day = addZeroToSingleDigitNumber(interaction.options.getInteger('day', true));
		const month = addZeroToSingleDigitNumber(interaction.options.getInteger('month', true));
		const year = interaction.options.getInteger('year') ?? 'XXXX';
		const birthday = `${year}-${month}-${day}`;

		await getBirthdays(interaction.guildId).create({ birthday, userId: user.id });

		const content = await resolveKey(interaction, 'commands/birthday:set.success', { ...options });

		return interaction.reply(interactionSuccess(content));
	}

	public async chatInputRunRemove(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const result = await getBirthdays(interaction.guildId).remove(user.id);

		if (!result) {
			return resolveKey(interaction, 'commands/birthday:remove.notRegistered', {
				command: BirthdayApplicationCommandMentions.Set,
				...options
			});
		}

		const content = await resolveKey(interaction, 'commands/birthday:remove.success', { ...options });

		return interaction.reply(interactionSuccess(content));
	}

	public async chatInputRunShow(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const birthday = getBirthdays(interaction.guild).get(user.id);

		if (isNullOrUndefined(birthday)) {
			const content = await resolveKey(interaction, 'commands/birthday:show.notRegistered', { ...options });
			return interaction.reply(interactionProblem(content));
		}

		const content = await resolveKey(interaction, 'commands/birthday:show.success', {
			...options,
			date: bold(formatDateForDisplay(birthday.birthday)),
			emoji: Emojis.ArrowRight
		});

		return interaction.reply(interactionSuccess(content));
	}

	public async chatInputRunTest(ctx: BirthdayySubcommand.Interaction<'cached'>) {
		const { user } = resolveTarget(ctx);
		const birthday = getBirthdays(ctx.guild).get(user.id);

		if (isNullOrUndefined(birthday)) {
			return ctx.reply(interactionProblem('This user has not yet registered his birthday '));
		}

		const result = await getBirthdays(ctx.guild).announcedBirthday(birthday);

		const content = result ? objectValues(result).join('\n') : 'Birthday Test Run';

		return ctx.reply(interactionSuccess(content));
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return builder
			.addSubcommand((subcommand) => this.registerSetSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerRemoveSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerListSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerShowSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerTestSubCommand(subcommand));
	}

	private registerSetSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:set')
			.addIntegerOption((option) => this.dayOptions(option, 'commands/birthday:set.day'))
			.addIntegerOption((option) => this.monthOptions(option, 'commands/birthday:set.month'))
			.addIntegerOption((option) => this.yearOptions(option, 'commands/birthday:set.year'))
			.addUserOption((option) => this.userOptions(option, 'commands/birthday:set.user'));
	}

	private registerListSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:list').addIntegerOption((option) =>
			this.monthOptions(option, 'commands/birthday:list.month').setRequired(false)
		);
	}

	private registerRemoveSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:remove').addUserOption((option) =>
			this.userOptions(option, 'commands/birthday:remove.user')
		);
	}

	private registerShowSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:show').addUserOption((option) =>
			this.userOptions(option, 'commands/birthday:show.user')
		);
	}

	private registerTestSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:test').addUserOption((option) =>
			this.userOptions(option, 'commands/birthday:test.user')
		);
	}

	private dayOptions(option: SlashCommandIntegerOption, key: string) {
		return applyLocalizedBuilder(option, key).setRequired(true).setMinValue(1).setMaxValue(31);
	}

	private monthOptions(option: SlashCommandIntegerOption, key: string) {
		return applyLocalizedBuilder(option, key).setRequired(true).setAutocomplete(true);
	}

	private yearOptions(option: SlashCommandIntegerOption, key: string) {
		const currentYear = dayjs().year();
		const minYear = currentYear - 100;
		return applyLocalizedBuilder(option, key).setMinValue(minYear).setMaxValue(currentYear).setRequired(false);
	}

	private userOptions(option: SlashCommandUserOption, key: string) {
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
