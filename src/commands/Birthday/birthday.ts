import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { addZeroToSingleDigitNumber, formatDateForDisplay, numberToMonthName } from '#utils/common';
import { Emojis } from '#utils/constants';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { getBirthdays } from '#utils/functions';
import { createSubcommandMappings, resolveTarget } from '#utils/utils';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions, RequiresUserPermissions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { isNullOrUndefined, objectValues } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import { bold, chatInputApplicationCommandMention } from 'discord.js';

@ApplyOptions<BirthdayySubcommand.Options>({
	description: 'commands/birthday:birthdayDescription',
	subcommands: createSubcommandMappings('list', 'set', 'remove', 'show', {
		name: 'test',
		preconditions: ['Moderator']
	}),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Everyone
})
export class BirthdayCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyDescriptionLocalizedBuilder(builder, this.description)
				.setName('birthday')
				.setDMPermission(false)
				.addSubcommand((builder) => registerBirthdaySubCommand(builder))
				.addSubcommand((builder) => listBirthdaySubCommand(builder))
				.addSubcommand((builder) => removeBirthdaySubCommand(builder))
				.addSubcommand((builder) => showBirthdaySubCommand(builder))
				.addSubcommand((builder) => testBirthdaySubCommand(builder))
		);
	}

	public async list(ctx: BirthdayySubcommand.Interaction<'cached'>) {
		const birthdayManager = getBirthdays(ctx.guild);
		await getBirthdays(ctx.guild).fetch();
		const month = ctx.options.getInteger('month');

		const birthdays = month ? birthdayManager.findBirthdayWithMonth(month) : birthdayManager.findTeenNextBirthday();

		const options = { month: numberToMonthName(Number(month)), context: month ? 'month' : '' };

		const title = month
			? await resolveKey(ctx, 'commands/birthday:list.title.month', options)
			: await resolveKey(ctx, 'commands/birthday:list.title.next');

		return birthdayManager.sendListBirthdays(ctx, birthdays, title);
	}

	public async set(ctx: BirthdayySubcommand.Interaction<'cached'>) {
		const { options, user } = resolveTarget(ctx);
		const day = addZeroToSingleDigitNumber(ctx.options.getInteger('day', true));
		const month = addZeroToSingleDigitNumber(ctx.options.getInteger('month', true));
		const year = ctx.options.getInteger('year') ?? 'XXXX';
		const birthday = `${year}-${month}-${day}`;

		await getBirthdays(ctx.guildId).create({ birthday, userId: user.id });

		return interactionSuccess(
			ctx,
			await resolveKey(ctx, 'commands/birthday:set.success', {
				birthday: bold(formatDateForDisplay(birthday)),
				...options
			})
		);
	}

	public async remove(ctx: BirthdayySubcommand.Interaction<'cached'>) {
		const { user, options } = resolveTarget(ctx);
		const result = await getBirthdays(ctx.guildId).remove(user.id);

		if (!result) {
			return resolveKey(ctx, 'commands/birthday:remove.notRegistered', {
				command: BirthdayApplicationCommandMentions.Set,
				...options
			});
		}

		return interactionSuccess(ctx, await resolveKey(ctx, 'commands/birthday:remove.success', { ...options }));
	}

	public async show(ctx: BirthdayySubcommand.Interaction<'cached'>) {
		const { user, options } = resolveTarget(ctx);
		const birthday = getBirthdays(ctx.guild).get(user.id);

		if (isNullOrUndefined(birthday)) {
			return interactionProblem(ctx, await resolveKey(ctx, 'commands/birthday:show.notRegistered'));
		}

		return interactionSuccess(
			ctx,
			await resolveKey(ctx, 'commands/birthday:show.success', {
				date: bold(formatDateForDisplay(birthday.birthday)),
				emoji: Emojis.ArrowRight,
				...options
			})
		);
	}

	@RequiresUserPermissions('ManageGuild')
	public async test(ctx: BirthdayySubcommand.Interaction<'cached'>) {
		const { user } = resolveTarget(ctx);
		const birthday = getBirthdays(ctx.guild).get(user.id);

		if (isNullOrUndefined(birthday)) {
			return interactionProblem(ctx, 'This user has not yet registered his birthday ');
		}

		const result = await getBirthdays(ctx.guild).announcedBirthday(birthday);

		const content = result ? objectValues(result).join('\n') : 'Birthday Test Run';

		return interactionSuccess(ctx, content);
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', envParseString('COMMANDS_BIRTHDAY_ID')),
	Set: chatInputApplicationCommandMention('birthday', 'set', envParseString('COMMANDS_BIRTHDAY_ID')),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', envParseString('COMMANDS_BIRTHDAY_ID')),
	Show: chatInputApplicationCommandMention('birthday', 'show', envParseString('COMMANDS_BIRTHDAY_ID')),
	Test: chatInputApplicationCommandMention('birthday', 'test', envParseString('COMMANDS_BIRTHDAY_ID'))
} as const;

function registerBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:setDescription')
		.setName('set')
		.addIntegerOption((option) => dayOptions(option, 'commands/birthday:set.day'))
		.addIntegerOption((option) => monthOptions(option, 'commands/birthday:set.month'))
		.addIntegerOption((option) => yearOptions(option, 'commands/birthday:set.year'))
		.addUserOption((option) => userOptions(option, 'commands/birthday:set.user'));
}

function listBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:listDescription')
		.setName('list')
		.addIntegerOption((option) => monthOptions(option, 'commands/birthday:list.month').setRequired(false));
}

function removeBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:removeDescription')
		.setName('remove')
		.addUserOption((option) => userOptions(option, 'commands/birthday:remove.user'));
}

function showBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:showDescription')
		.setName('show')
		.addUserOption((option) => userOptions(option, 'commands/birthday:show.user'));
}

function testBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:testDescription')
		.setName('test')
		.addUserOption((option) => userOptions(option, 'commands/birthday:test.user'));
}
