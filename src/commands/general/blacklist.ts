import { userOptions } from '#lib/components/builder';
import { defaultUserPermissions } from '#lib/types';
import { PrismaErrorCodeEnum } from '#utils/constants';
import { defaultEmbed, interactionProblem, interactionSuccess } from '#utils/embed';
import { getCommandGuilds, resolveOnErrorCodesPrisma } from '#utils/functions';
import { resolveTarget } from '#utils/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, SlashCommandBuilder, chatInputApplicationCommandMention, time, userMention } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	subcommands: [
		{
			name: 'add',
			chatInputRun: 'add',
			type: 'method',
		},
		{
			name: 'list',
			chatInputRun: 'list',
			type: 'method',
		},
		{
			name: 'remove',
			chatInputRun: 'remove',
			type: 'method',
		},
	],
})
export class BlacklistCommand extends Subcommand {
	public override async registerApplicationCommands(
		registry: import('@sapphire/framework').ApplicationCommandRegistry,
	) {
		const guildIds = await getCommandGuilds('premium');
		registry.registerChatInputCommand((builder) => registerBlacklistCommand(builder), { guildIds });
	}

	public async add(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options } = resolveTarget(interaction);

		if (!options.context) return interactionProblem(interaction, 'commands/blacklist:add.cannotBlacklistSelf');

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.blacklist.create({ data: { guildId: interaction.guildId, userId: user.id } }),
			PrismaErrorCodeEnum.UniqueConstraintFailed,
		);

		const tOptions = { user: userMention(user.id) };

		if (!result) return interactionProblem(interaction, 'commands/blacklist:add.alReadyBlacklisted', tOptions);

		return interactionSuccess(interaction, 'commands/blacklist:add.success', tOptions);
	}

	public async list(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const result = await this.container.prisma.blacklist.findMany({
			where: { guildId: interaction.guildId },
		});

		const embed = new EmbedBuilder(defaultEmbed()).setTitle(
			await resolveKey(interaction, 'commands/blacklist:list.title'),
		);

		if (result.length === 0) {
			const emptyEmbed = embed.setDescription(await resolveKey(interaction, 'commands/blacklist:list.empty'));
			return interaction.reply({ embeds: [emptyEmbed] });
		}

		const paginateMessage = new PaginatedFieldMessageEmbed<import('@prisma/client').Blacklist>();

		paginateMessage.setTemplate(embed).setItems(result).formatItems(formatList).setItemsPerPage(6);

		return paginateMessage.make().run(interaction, interaction.user);
	}

	public async remove(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { user } = resolveTarget(interaction);

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.blacklist.delete({
				where: { userId_guildId: { guildId: interaction.guildId, userId: user.id } },
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		const options = { user: userMention(user.id) };

		if (!result) return interactionProblem(interaction, 'commands/blacklist:remove.notFound', options);

		return interactionSuccess(interaction, 'commands/blacklist:remove.success', options);
	}
}

function formatList(user: import('@prisma/client').Blacklist) {
	const formattedDate = time(Math.floor(user.addedAt.getTime() / 1000), 'D');
	return `${userMention(user.userId)} - ${formattedDate}`;
}

export const BlacklistApplicationCommandMentions = {
	Add: chatInputApplicationCommandMention('blacklist', 'add', ''),
	List: chatInputApplicationCommandMention('blacklist', 'list', ''),
	Remove: chatInputApplicationCommandMention('blacklist', 'remove', ''),
} as const;

export function registerBlacklistCommand(builder: SlashCommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/blacklist:blacklist')
		.setDefaultMemberPermissions(defaultUserPermissions.add('ManageRoles').bitfield)
		.setDMPermission(false)
		.addSubcommand((builder) => addBlacklistSubCommand(builder))
		.addSubcommand((builder) => removeBlacklistSubCommand(builder))
		.addSubcommand((builder) => listBlacklistSubCommand(builder));
}

export function addBlacklistSubCommand(builder: import('discord.js').SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/blacklist:add').addUserOption((option) =>
		userOptions(option, 'commands/blacklist:add.user').setRequired(true),
	);
}

export function removeBlacklistSubCommand(builder: import('discord.js').SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/blacklist:remove').addUserOption((option) =>
		userOptions(option, 'commands/blacklist:remove.user').setRequired(true),
	);
}

export function listBlacklistSubCommand(builder: import('discord.js').SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/blacklist:list');
}
