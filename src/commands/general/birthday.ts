import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import thinking from '#lib/discord/thinking';
import { CustomSubCommand } from '#lib/structures/commands/CustomCommand';
import { defaultUserPermissions } from '#lib/types/permissions';
import {
	Emojis,
	PrismaErrorCodeEnum,
	createSubcommandMappings,
	generateDefaultEmbed,
	interactionProblem,
	interactionSuccess,
	resolveTarget,
} from '#utils';
import { generateBirthdayList, updateBirthdayOverview } from '#utils/birthday';
import { formatDateForDisplay, getDateFromInteraction } from '#utils/common/date';
import { getBirthdays } from '#utils/functions/guilds';
import { resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { isNullOrUndefined, objectValues } from '@sapphire/utilities';
import {
	bold,
	chatInputApplicationCommandMention,
	type SlashCommandBuilder,
	type SlashCommandSubcommandBuilder,
} from 'discord.js';

@ApplyOptions<CustomSubCommand.Options>({
	subcommands: createSubcommandMappings(
		'list',
		{ name: 'set', preconditions: ['RoleHigher'] },
		{ name: 'remove', preconditions: ['RoleHigher'] },
		'show',
		{ name: 'test', preconditions: ['Moderator'] },
	),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class BirthdayCommand extends CustomSubCommand {
	public override registerApplicationCommands(registry: CustomSubCommand.Registry) {
		registry.registerChatInputCommand((builder) => registerBirthdayCommand(builder));
	}

	public async list(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { embed, components } = await generateBirthdayList(1, ctx.guild);
		return ctx.reply({ components, embeds: [generateDefaultEmbed(embed)] });
	}

	public async set(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(ctx);
		const target = resolveTarget(ctx);
		const birthday = getDateFromInteraction(ctx);

		await getBirthdays(ctx.guildId).create({ birthday, userId: target.user.id });

		await updateBirthdayOverview(ctx.guildId);
		return interactionSuccess(
			ctx,
			await resolveKey(ctx, 'commands/birthday:set.success', { date: formatDateForDisplay(birthday) }),
		);
	}

	public async remove(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(ctx);
		const data = { userId_guildId: { guildId: ctx.guildId, userId: user.id } };
		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.delete({ where: data }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (!result) {
			return interactionProblem(
				ctx,
				await resolveKey(ctx, await resolveKey(ctx, 'commands/birthday:remove.notRegistered', { ...options })),
			);
		}

		getBirthdays(ctx.guildId).delete(user.id);
		await updateBirthdayOverview(ctx.guildId);
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
		.setDefaultMemberPermissions(defaultUserPermissions.bitfield)
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
		.addStringOption((option) => monthOptions(option, 'commands/birthday:set.month'))
		.addIntegerOption((option) => yearOptions(option, 'commands/birthday:set.year'))
		.addUserOption((option) => userOptions(option, 'commands/birthday:set.user'));
}

function listBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:list');
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
