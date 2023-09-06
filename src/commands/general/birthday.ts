import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import { RequiresUserPermissionsIfTargetIsNotAuthor } from '#lib/structures';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { defaultUserPermissions } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
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
import { resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import {
	bold,
	chatInputApplicationCommandMention,
	type SlashCommandBuilder,
	type SlashCommandSubcommandBuilder,
} from 'discord.js';

@ApplyOptions<CustomCommand.Options>({
	subcommands: createSubcommandMappings('list', 'set', 'remove', 'show', {
		name: 'test',
		preconditions: ['Moderator'],
	}),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class BirthdayCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand((builder) => registerBirthdayCommand(builder));
	}

	public async list(interaction: CustomCommand.ChatInputCommandInteraction<'cached'>) {
		const { embed, components } = await generateBirthdayList(1, interaction.guild);
		return interaction.reply({ components, embeds: [generateDefaultEmbed(embed)] });
	}

	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:set', defaultUserPermissions.add('ManageGuild'))
	public async set(interaction: CustomCommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const birthday = getDateFromInteraction(interaction);

		await this.container.prisma.birthday.upsert({
			create: { birthday, guildId: interaction.guildId, userId: user.id },
			where: { userId_guildId: { guildId: interaction.guildId, userId: user.id } },
			update: { birthday },
		});
		await updateBirthdayOverview(interaction.guildId);
		return interactionSuccess(interaction, 'commands/birthday:set.success', options);
	}

	@RequiresUserPermissionsIfTargetIsNotAuthor('commands/birthday:remove', defaultUserPermissions.add('ManageRoles'))
	public async remove(interaction: CustomCommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const data = { userId_guildId: { guildId: interaction.guildId, userId: user.id } };
		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.delete({ where: data }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (!result) return interactionProblem(interaction, 'commands/birthday:remove.notRegistered', options);

		await updateBirthdayOverview(interaction.guildId);
		return interactionSuccess(interaction, 'commands/birthday:remove.success', options);
	}

	public async show(interaction: CustomCommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);
		const where = { guildId: interaction.guildId, userId: user.id };
		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.findFirstOrThrow({ where }),
			PrismaErrorCodeEnum.NotFound,
		);

		if (!result) return interactionProblem(interaction, 'commands/birthday:show.notRegistered');

		await updateBirthdayOverview(interaction.guildId);
		return interactionSuccess(interaction, 'commands/birthday:show.success', {
			date: bold(formatDateForDisplay(result.birthday)),
			emoji: Emojis.ArrowRight,
			...options,
		});
	}

	public async test(interaction: CustomCommand.ChatInputCommandInteraction<'cached'>) {
		const { user } = resolveTarget(interaction);

		await this.container.tasks.run('BirthdayReminderTask', {
			guildId: interaction.guildId,
			isTest: true,
			userId: user.id,
		});
		return interaction.reply({ content: 'Birthday Test Run' });
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
