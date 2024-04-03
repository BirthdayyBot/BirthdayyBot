import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import { CustomSubCommand } from '#lib/structures/commands/CustomCommand';
import { DEFAULT_REQUIRED_CLIENT_PERMISSIONS } from '#lib/structures/commands/utils.js';
import { addZeroToSingleDigitNumber } from '#lib/utils/common/string';
import { Emojis, createSubcommandMappings, interactionProblem, interactionSuccess, resolveTarget } from '#utils';
import { formatDateForDisplay, numberToMonthName } from '#utils/common/date';
import { getBirthdays } from '#utils/functions/guilds';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { isNullOrUndefined, objectValues } from '@sapphire/utilities';
import { bold, chatInputApplicationCommandMention } from 'discord.js';

@ApplyOptions<CustomSubCommand.Options>({
	name: 'birthday',
	description: 'commands/birthday:birthdayDescription',
	subcommands: createSubcommandMappings(
		'list',
		{ name: 'set', preconditions: [['Manager', 'RoleHigher']] },
		{ name: 'remove', preconditions: ['Manager', 'RoleHigher'] },
		'show',
		{ name: 'test', preconditions: ['Manager'] },
	),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	requiredClientPermissions: DEFAULT_REQUIRED_CLIENT_PERMISSIONS,
})
export class BirthdayCommand extends CustomSubCommand {
	public override registerApplicationCommands(registry: CustomSubCommand.Registry) {
		registry.registerChatInputCommand((builder) => registerBirthdayCommand(builder));
	}

	public async list(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
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

	public async set(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
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
				...options,
			}),
		);
	}

	public async remove(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(ctx);
		const result = await getBirthdays(ctx.guildId).remove(user.id);

		if (!result) {
			return resolveKey(ctx, 'commands/birthday:remove.notRegistered', {
				command: BirthdayApplicationCommandMentions.Set,
				...options,
			});
		}

		return interactionSuccess(ctx, await resolveKey(ctx, 'commands/birthday:remove.success', { ...options }));
	}

	public async show(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
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
				...options,
			}),
		);
	}

	public async test(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { user } = resolveTarget(ctx);
		const birthay = getBirthdays(ctx.guild).get(user.id);

		if (isNullOrUndefined(birthay)) {
			return interactionProblem(ctx, 'This user has not yet registered his birthday ');
		}

		const result = await getBirthdays(ctx.guild).announcedBirthday(birthay);

		const content = result ? objectValues(result).join('\n') : 'Birthday Test Run';

		return interactionSuccess(ctx, content);
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', '935174192389840896'),
	Set: chatInputApplicationCommandMention('birthday', 'set', '935174192389840896'),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', '935174192389840896'),
	Show: chatInputApplicationCommandMention('birthday', 'show', '935174192389840896'),
	Test: chatInputApplicationCommandMention('birthday', 'test', '935174192389840896'),
} as const;

function registerBirthdayCommand(builder: SlashCommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:birthday')
		.setDMPermission(false)
		.addSubcommand((builder) => registerBirthdaySubCommand(builder))
		.addSubcommand((builder) => listBirthdaySubCommand(builder))
		.addSubcommand((builder) => removeBirthdaySubCommand(builder))
		.addSubcommand((builder) => showBirthdaySubCommand(builder))
		.addSubcommand((builder) => testBirthdaySubCommand(builder));
}

function registerBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:set')
		.addIntegerOption((option) => dayOptions(option, 'commands/birthday:set.day'))
		.addIntegerOption((option) => monthOptions(option, 'commands/birthday:set.month'))
		.addIntegerOption((option) => yearOptions(option, 'commands/birthday:set.year'))
		.addUserOption((option) => userOptions(option, 'commands/birthday:set.user'));
}

function listBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:list').addIntegerOption((option) =>
		monthOptions(option, 'commands/birthday:list.month').setRequired(false),
	);
}

function removeBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:remove').addUserOption((option) =>
		userOptions(option, 'commands/birthday:remove.user'),
	);
}

function showBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:show').addUserOption((option) =>
		userOptions(option, 'commands/birthday:show.user'),
	);
}

function testBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:test').addUserOption((option) =>
		userOptions(option, 'commands/birthday:test.user'),
	);
}
