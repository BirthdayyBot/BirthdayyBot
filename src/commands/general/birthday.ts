import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import { replyToInteraction } from '#lib/discord/interaction';
import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures/index';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { generateBirthdayList } from '#utils/birthday/birthday';
import { updateBirthdayOverview } from '#utils/birthday/overview';
import { formatDateForDisplay, getDateFromInteraction } from '#utils/common/date';
import { Emojis, PrismaErrorCodeEnum } from '#utils/constants';
import { generateDefaultEmbed, interactionProblem, interactionSuccess } from '#utils/embed';
import { resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { resolveTarget } from '#utils/utils';
import { ApplyOptions, RequiresUserPermissions } from '@sapphire/decorators';
import { applyLocalizedBuilder, type StringMap, type TOptions } from '@sapphire/plugin-i18next';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { type NonNullObject } from '@sapphire/utilities';
import {
	bold,
	chatInputApplicationCommandMention,
	type SlashCommandBuilder,
	type SlashCommandSubcommandBuilder,
} from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	name: 'birthday',
	subcommands: [
		{
			name: 'list',
			chatInputRun: 'list',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'set',
			chatInputRun: 'set',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'remove',
			chatInputRun: 'remove',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'show',
			chatInputRun: 'show',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'test',
			chatInputRun: 'test',
			runIn: 'GUILD_TEXT',
			preconditions: ['CanManageRoles'],
			type: 'method',
		},
	],
	requiredClientPermissions: defaultClientPermissions,
	requiredUserPermissions: defaultUserPermissions,
})
export class BirthdayCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand((builder) => registerBirthdayCommand(builder));
	}

	public async list(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { embed, components } = await generateBirthdayList(1, interaction.guild);

		return replyToInteraction(interaction, { components, embeds: [generateDefaultEmbed(embed)] });
	}

	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:set', defaultUserPermissions.add('ManageGuild'))
	public async set(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const birthday = getDateFromInteraction(interaction);

		await this.container.prisma.birthday.upsert({
			create: { birthday, guildId: interaction.guildId, userId: user.id },
			where: { userId_guildId: { guildId: interaction.guildId, userId: user.id } },
			update: { birthday },
		});

		return this.success(interaction, 'commands/birthday:set.success', options);
	}

	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:remove', defaultUserPermissions.add('ManageRoles'))
	public async remove(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		const data = { userId_guildId: { guildId: interaction.guildId, userId: user.id } };

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.delete({ where: data }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (!result) return interactionProblem(interaction, 'commands/birthday:remove.notRegistered', options);

		return this.success(interaction, 'commands/birthday:remove.success', options);
	}

	public async show(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		const where = { guildId: interaction.guildId, userId: user.id };

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.findFirstOrThrow({ where }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (!result) return interactionProblem(interaction, 'commands/birthday:show.notRegistered');

		return this.success(interaction, 'commands/birthday:show.success', {
			date: bold(formatDateForDisplay(result.birthday)),
			emoji: Emojis.ArrowRight,
			...options,
		});
	}

	@RequiresUserPermissions(defaultUserPermissions.add('ManageGuild'))
	public async test(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { user } = resolveTarget(interaction);

		await this.container.tasks.run('BirthdayReminderTask', {
			guildId: interaction.guildId,
			isTest: true,
			userId: user.id,
		});

		return replyToInteraction(interaction, 'Birthday Test Run!');
	}

	private async success<T extends NonNullObject = StringMap>(
		interaction: Subcommand.ChatInputCommandInteraction<'cached'>,
		key: string,
		options: TOptions<T>,
	) {
		await updateBirthdayOverview(interaction.guildId);
		return interactionSuccess(interaction, key, options);
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
