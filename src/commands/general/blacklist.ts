import { userOptions } from '#lib/components/builder';
import { CustomSubCommand } from '#lib/structures/commands/CustomCommand';
import { defaultUserPermissions } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { PrismaErrorCodeEnum } from '#utils/constants';
import { defaultEmbed, interactionProblem, interactionSuccess } from '#utils/embed';
import { getCommandGuilds, resolveOnErrorCodesPrisma } from '#utils/functions';
import { createSubcommandMappings, resolveTarget } from '#utils/utils';
import type { Blacklist } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import {
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	chatInputApplicationCommandMention,
	time,
	userMention,
} from 'discord.js';

@ApplyOptions<CustomSubCommand.Options>({
	subcommands: createSubcommandMappings('add', 'list', 'remove'),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Moderator,
})
export class BlacklistCommand extends CustomSubCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		const guildIds = await getCommandGuilds('premium');
		registry.registerChatInputCommand((builder) => registerBlacklistCommand(builder), { guildIds });
	}

	public async add(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { user, options: _ } = resolveTarget(ctx);

		if (!_.context) {
			return interactionProblem(ctx, await resolveKey(ctx, 'commands/blacklist:add.cannotBlacklistSelf'));
		}

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.blacklist.create({ data: { guildId: ctx.guildId, userId: user.id } }),
			PrismaErrorCodeEnum.UniqueConstraintFailed,
		);

		const options = { user: userMention(user.id) };

		if (!result) {
			return interactionProblem(ctx, await resolveKey(ctx, 'commands/blacklist:add.alReadyBlacklisted', options));
		}

		return interactionSuccess(ctx, await resolveKey(ctx, 'commands/blacklist:add.success', options));
	}

	public async list(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const result = await this.container.prisma.blacklist.findMany({
			where: { guildId: ctx.guildId },
		});

		const embed = new EmbedBuilder(defaultEmbed()).setTitle(await resolveKey(ctx, 'commands/blacklist:list.title'));

		if (result.length === 0) {
			const emptyEmbed = embed.setDescription(await resolveKey(ctx, 'commands/blacklist:list.empty'));
			return ctx.reply({ embeds: [emptyEmbed] });
		}

		const paginateMessage = new PaginatedFieldMessageEmbed<Blacklist>();

		paginateMessage.setTemplate(embed).setItems(result).formatItems(formatList).setItemsPerPage(6);

		return paginateMessage.make().run(ctx, ctx.user);
	}

	public async remove(ctx: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { user } = resolveTarget(ctx);

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.blacklist.delete({
				where: { userId_guildId: { guildId: ctx.guildId, userId: user.id } },
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		const options = { user: userMention(user.id) };

		if (!result) {
			return interactionProblem(ctx, await resolveKey(ctx, 'commands/blacklist:remove.notFound', options));
		}

		return interactionSuccess(ctx, await resolveKey(ctx, 'commands/blacklist:remove.success', options));
	}
}

function formatList(user: Blacklist) {
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

export function addBlacklistSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/blacklist:add').addUserOption((option) =>
		userOptions(option, 'commands/blacklist:add.user').setRequired(true),
	);
}

export function removeBlacklistSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/blacklist:remove').addUserOption((option) =>
		userOptions(option, 'commands/blacklist:remove.user').setRequired(true),
	);
}

export function listBlacklistSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/blacklist:list');
}
