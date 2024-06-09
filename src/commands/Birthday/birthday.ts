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
import { applyDescriptionLocalizedBuilder, fetchT, resolveKey } from '@sapphire/plugin-i18next';
import { isNullOrUndefined, isNullish, objectValues } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import dayjs from 'dayjs';
import {
	SlashCommandBuilder,
	SlashCommandIntegerOption,
	SlashCommandUserOption,
	bold,
	chatInputApplicationCommandMention
} from 'discord.js';

@ApplyOptions<BirthdayySubcommand.Options>({
	subcommands: [
		{ name: 'list', chatInputRun: 'chatInputRunList' },
		{ name: 'set', chatInputRun: 'chatInputRunSet' },
		{ name: 'remove', chatInputRun: 'chatInputRunRemove' },
		{ name: 'show', chatInputRun: 'chatInputRunShow' },
		{ name: 'test', chatInputRun: 'chatInputRunTest', preconditions: ['Moderator'] },
		{ name: 'upcoming', chatInputRun: 'chatInputRunUpcoming' }
	],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Everyone
})
export class BirthdayCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			this.registerSubcommands(
				applyDescriptionLocalizedBuilder(builder, 'commands/birthday:description')
					.setName('birthday')
					.setDMPermission(false)
			)
		);
	}

	public async chatInputRunList(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const birthdayManager = getBirthdays(interaction.guild);
		await getBirthdays(interaction.guild).fetch();
		const month = interaction.options.getInteger('month');

		const birthdays = month ? birthdayManager.findBirthdayWithMonth(month) : birthdayManager.findAllBirthdays();
		const options = {
			month: numberToMonthName(Number(month)),
			context: birthdays.length < 1 ? 'empty' : '',
			serverName: interaction.guild.name
		};

		const key = month ? 'commands/birthday:list.title.month' : 'commands/birthday:list.title.normal';
		const title = await resolveKey(interaction, key, options);

		return birthdayManager.sendPaginatedBirthdays(interaction, birthdays, title);
	}

	public async chatInputRunSet(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const { options, user } = resolveTarget(interaction);
		const day = addZeroToSingleDigitNumber(interaction.options.getInteger('day', true));
		const month = addZeroToSingleDigitNumber(interaction.options.getInteger('month', true));
		const year = interaction.options.getInteger('year') ?? 'XXXX';
		const birthday = `${year}-${month}-${day}`;
		const t = await fetchT(interaction);
		const newBirthday = await getBirthdays(interaction.guildId).upsert({ birthday, userId: user.id });

		if (isNullish(newBirthday)) {
			return interaction.reply(interactionProblem(t('commands/birthday:set.error', { ...options })));
		}

		const content = t('commands/birthday:set.success', {
			birthday: formatDateForDisplay(birthday),
			...options
		});

		return interaction.reply(interactionSuccess(content));
	}

	public async chatInputRunRemove(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const result = await getBirthdays(interaction.guildId).remove(user.id);
		const t = await fetchT(interaction);

		if (isNullish(result)) {
			const content = t('commands/birthday:remove.notRegistered', {
				command: BirthdayApplicationCommandMentions.Set,
				...options
			});
			return interaction.reply(interactionProblem(content));
		}

		const content = t('commands/birthday:remove.success', { ...options });

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

	public async chatInputRunTest(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const { user } = resolveTarget(interaction);
		const birthday = getBirthdays(interaction.guild).get(user.id);

		if (isNullOrUndefined(birthday)) {
			return interaction.reply(interactionProblem('This user has not yet registered his birthday '));
		}

		const result = await getBirthdays(interaction.guild).announcedBirthday(birthday);

		const content = result ? objectValues(result).join('\n') : 'Birthday Test Run';

		return interaction.reply(interactionSuccess(content));
	}

	public async chatInputRunUpcoming(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const birthdayManager = getBirthdays(interaction.guild);
		await getBirthdays(interaction.guild).fetch();
		const upcomingBirthdays = birthdayManager.findUpcomingBirthdays();

		const options = { context: 'upcoming' };

		const title = upcomingBirthdays
			? await resolveKey(interaction, 'commands/birthday:upcoming.title', options)
			: await resolveKey(interaction, 'commands/birthday:upcoming.title');

		return birthdayManager.sendPaginatedBirthdays(interaction, upcomingBirthdays, title);
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return builder
			.addSubcommand((subcommand) => this.registerSetSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerRemoveSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerListSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerShowSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerTestSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerUpcomingSubCommand(subcommand));
	}

	private registerSetSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:set.description')
			.setName('set')
			.addIntegerOption((option) => this.dayOptions(option, 'commands/birthday:set.dayDescription'))
			.addIntegerOption((option) => this.monthOptions(option, 'commands/birthday:set.monthDescription'))
			.addIntegerOption((option) => this.yearOptions(option, 'commands/birthday:set.yearDescription'))
			.addUserOption((option) => this.userOptions(option, 'commands/birthday:set.userDescription'));
	}

	private registerListSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:list.description')
			.setName('list')
			.addIntegerOption((option) =>
				this.monthOptions(option, 'commands/birthday:list.monthDescription').setRequired(false)
			);
	}

	private registerRemoveSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:remove.description')
			.setName('remove')
			.addUserOption((option) => this.userOptions(option, 'commands/birthday:remove.userDescription'));
	}

	private registerShowSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:show.description')
			.setName('show')
			.addUserOption((option) => this.userOptions(option, 'commands/birthday:show.userDescription'));
	}

	private registerTestSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:test.description')
			.setName('test')
			.addUserOption((option) => this.userOptions(option, 'commands/birthday:test.userDescription'));
	}

	private registerUpcomingSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:upcoming.description').setName('upcoming');
	}

	private dayOptions(option: SlashCommandIntegerOption, descriptionKey: string) {
		return applyDescriptionLocalizedBuilder(option, descriptionKey)
			.setName('day')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(31);
	}

	private monthOptions(option: SlashCommandIntegerOption, descriptionKey: string) {
		return applyDescriptionLocalizedBuilder(option, descriptionKey)
			.setName('month')
			.setRequired(true)
			.setAutocomplete(true);
	}

	private yearOptions(option: SlashCommandIntegerOption, descriptionKey: string) {
		const currentYear = dayjs().year();
		const minYear = currentYear - 100;
		return applyDescriptionLocalizedBuilder(option, descriptionKey)
			.setName('year')
			.setMinValue(minYear)
			.setMaxValue(currentYear)
			.setRequired(false);
	}

	private userOptions(option: SlashCommandUserOption, descriptionKey: string) {
		return applyDescriptionLocalizedBuilder(option, descriptionKey).setName('user').setRequired(false);
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', envParseString('COMMANDS_BIRTHDAY_ID')),
	Set: chatInputApplicationCommandMention('birthday', 'set', envParseString('COMMANDS_BIRTHDAY_ID')),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', envParseString('COMMANDS_BIRTHDAY_ID')),
	Show: chatInputApplicationCommandMention('birthday', 'show', envParseString('COMMANDS_BIRTHDAY_ID')),
	Test: chatInputApplicationCommandMention('birthday', 'test', envParseString('COMMANDS_BIRTHDAY_ID'))
} as const;
