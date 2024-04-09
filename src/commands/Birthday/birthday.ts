import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import { DEFAULT_REQUIRED_CLIENT_PERMISSIONS } from '#lib/structures';
import { CustomSubCommand } from '#lib/structures/commands/CustomCommand';
import { updateBirthdayOverview } from '#lib/utils/birthday/overview';
import { addZeroToSingleDigitNumber } from '#lib/utils/common/string';
import { floatPromise, resolveOnErrorCodesPrisma } from '#lib/utils/functions/promises';
import {
	createSubcommandMappings,
	Emojis,
	interactionProblem,
	interactionSuccess,
	PrismaErrorCodeEnum,
	resolveTarget,
} from '#utils';
import { formatDateForDisplay, numberToMonthName } from '#utils/common/date';
import { getBirthdays } from '#utils/functions/guilds';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { isNullish, isNullOrUndefined } from '@sapphire/utilities';
import { bold, chatInputApplicationCommandMention } from 'discord.js';

@ApplyOptions<CustomSubCommand.Options>({
	name: 'birthday',
	description: 'commands/birthday:birthdayDescription',
	detailedDescription: 'commands/birthday:birthdayExtended',
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

	public async list(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const birthdayManager = getBirthdays(interaction.guild);
		const month = interaction.options.getInteger('month');

		const birthdays = month ? birthdayManager.findBirthdayWithMonth(month) : birthdayManager.findTeenNextBirthday();

		const options = { month: numberToMonthName(Number(month)), context: month ? 'month' : '' };

		const title = month
			? await resolveKey(interaction, 'commands/birthday:list.title.month', options)
			: await resolveKey(interaction, 'commands/birthday:list.title.next');

		return birthdayManager.sendListBirthdays(interaction, birthdays, title);
	}

	public async set(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const day = interaction.options.getInteger('day', true);
		const month = interaction.options.getInteger('month', true);
		const year = interaction.options.getInteger('year');

		const context = target === interaction.user ? 'user' : 'self';

		const birthday = `${year ?? 'XXXX'}/${addZeroToSingleDigitNumber(month)}/${addZeroToSingleDigitNumber(day)}`;

		await this.container.prisma.birthday.upsert({
			create: { userId: target.id, guildId: interaction.guildId, birthday },
			where: { userId_guildId: { guildId: interaction.guildId, userId: target.id } },
			update: { birthday },
		});

		floatPromise(updateBirthdayOverview(interaction.guild));

		const content = await resolveKey(interaction, 'commands/birthday:set.success', { birthday, target, context });

		return interaction.reply(content);
	}

	public async remove(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const context = target ? 'user' : 'self';

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.delete({
				where: { userId_guildId: { guildId: interaction.guildId, userId: target.id } },
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullish(result)) {
			const key = await resolveKey(interaction, 'commands/birthday:remove.notRegistered', { target, context });
			return interactionProblem(interaction, key);
		}

		floatPromise(updateBirthdayOverview(interaction.guild));

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/birthday:remove.success', { target, context }),
		);
	}

	public async show(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const birthday = getBirthdays(interaction.guild).get(user.id);

		if (isNullOrUndefined(birthday)) {
			return interactionProblem(
				interaction,
				await resolveKey(interaction, 'commands/birthday:show.notRegistered'),
			);
		}

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/birthday:show.success', {
				date: bold(formatDateForDisplay(birthday.birthday)),
				emoji: Emojis.Arrow,
				...options,
			}),
		);
	}

	public async test(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const context = target ? 'user' : 'self';

		const birthay = await this.container.prisma.birthday.findUnique({
			where: { userId_guildId: { guildId: interaction.guildId, userId: target.id } },
		});

		if (isNullish(birthay)) {
			const key = await resolveKey(interaction, 'commands/birthday:remove.notRegistered', { target, context });
			return interactionProblem(interaction, key);
		}

		const payload = { userId: target.id, guildId: interaction.guildId, isTest: true };

		await this.container.tasks.create({ name: 'BirthdayReminderTask', payload });

		return interaction.reply(
			'Birthday reminder task created. Consult the overview and your roles to verify that the task has been carried out correctly.',
		);
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
