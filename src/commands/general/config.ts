import type { ConfigName } from '#lib/database/types';
import thinking from '#lib/discord/thinking';
import { defaultClientPermissions, defaultUserPermissions, hasBotChannelPermissions } from '#lib/types/permissions';
import { generateBirthdayList } from '#utils/birthday/birthday';
import generateConfigList from '#utils/birthday/config';
import { PrismaErrorCodeEnum } from '#utils/constants';
import { generateDefaultEmbed, interactionProblem, interactionSuccess } from '#utils/embed';
import { setDefaultConfig } from '#utils/functions/config';
import { resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { reply } from '#utils/utils';
import { Prisma } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import {
	applyLocalizedBuilder,
	createLocalizedChoice,
	resolveKey,
	type StringMap,
	type TOptions,
} from '@sapphire/plugin-i18next';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { isNullOrUndefinedOrEmpty, type NonNullObject } from '@sapphire/utilities';
import {
	ChannelType,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
	bold,
	channelMention,
	chatInputApplicationCommandMention,
	roleMention,
	type PermissionResolvable,
} from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	name: 'config',
	subcommands: [
		{
			name: 'announcement-channel',
			chatInputRun: 'announcementChannel',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'announcement-message',
			chatInputRun: 'announcementMessage',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'birthday-role',
			chatInputRun: 'birthdayRole',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'list',
			chatInputRun: 'list',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'overview-channel',
			chatInputRun: 'overviewChannel',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'ping-role',
			chatInputRun: 'pingRole',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'reset',
			chatInputRun: 'reset',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
		{
			name: 'timezone',
			chatInputRun: 'timezone',
			runIn: 'GUILD_TEXT',
			type: 'method',
		},
	],
	requiredClientPermissions: defaultClientPermissions,
	requiredUserPermissions: defaultUserPermissions.add('ManageRoles'),
})
export class ConfigCommand extends Subcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => registerConfigCommand(builder), {
			guildIds: ['980559116076470272'],
		});
	}

	public async announcementChannel(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const announcementChannel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]).id;
		const permissions: PermissionResolvable[] = ['ViewChannel', 'SendMessages'];
		const options = { channel: channelMention(announcementChannel) };

		if (!hasBotChannelPermissions({ interaction, channel: announcementChannel, permissions })) {
			return interactionProblem(interaction, `commands/config:announcementChannel.cannotPermissions`, options);
		}

		return this.updateConfig({ announcementChannel }, interaction, `announcementChannel`, options);
	}

	public async announcementMessage(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const announcementMessage = interaction.options.getString('message', true);

		const guild = await this.container.prisma.guild.findUniqueOrThrow({
			where: { guildId: interaction.guildId },
		});

		if (!guild.premium)
			return interactionProblem(interaction, 'commands/config:announcementMessage.requirePremium');

		return this.updateConfig({ announcementMessage }, interaction, `announcementMessage`, {
			message: announcementMessage,
		});
	}

	public async birthdayRole(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const { id: birthdayRole, position } = interaction.options.getRole('role', true);
		const bot = await interaction.guild.members.fetchMe();
		const highestBotRole = bot.roles.highest;

		if (highestBotRole.position <= position) {
			return interactionProblem(interaction, 'commands/config.birthdayRole.highestBotRole');
		}

		return this.updateConfig({ birthdayRole }, interaction, 'birthdayRole', {
			role: roleMention(birthdayRole),
		});
	}

	public async list(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const configEmbed = await generateConfigList(interaction.guildId, { guild: interaction.guild });

		return reply(interaction, { embeds: [generateDefaultEmbed(configEmbed)] });
	}

	public async overviewChannel(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const channel = interaction.options.getChannel<ChannelType.GuildText>('channel', true);
		const permissions: PermissionResolvable[] = ['ViewChannel', 'SendMessages'];

		if (!hasBotChannelPermissions({ interaction, channel, permissions })) {
			return interactionProblem(interaction, 'commands/config:overviewChannel.cannotPermissions', {
				channel: channelMention(channel.id),
			});
		}

		const birthdayList = await generateBirthdayList(1, interaction.guild);
		const birthdayListEmbed = generateDefaultEmbed(birthdayList.embed);

		const message = await channel.send({
			embeds: [birthdayListEmbed],
			components: birthdayList.components,
		});

		return this.updateConfig(
			{ overviewMessage: message.id, overviewChannel: channel.id },
			interaction,
			'overviewChannel',
			{
				channel: channelMention(channel.id),
				message: message.url,
			},
		);
	}

	public async pingRole(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const role = interaction.options.getRole('role', true);

		return this.updateConfig({ birthdayPingRole: role.id }, interaction, 'pingRole', {
			role: roleMention(role.id),
		});
	}

	public async reset(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		const config = interaction.options.getString('config', true) as ConfigName;
		this.container.logger.debug(config);
		const result = await resolveOnErrorCodesPrisma(
			setDefaultConfig(config, interaction.guildId),
			PrismaErrorCodeEnum.NotFound,
		);

		const configName = bold(await resolveKey(interaction, `commands/config:reset.choices.${config}`));
		if (isNullOrUndefinedOrEmpty(result)) {
			return interactionProblem(interaction, 'commands/config:reset.error', {
				config: configName,
			});
		}

		return interactionSuccess(interaction, 'commands/config:reset.success', {
			config: configName,
		});
	}

	public async timezone(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);

		const timezone = interaction.options.getInteger('timezone', true);

		await this.container.prisma.guild.upsert({
			create: { guildId: interaction.guildId, timezone },
			where: { guildId: interaction.guildId },
			update: { timezone },
		});

		return this.updateConfig({ timezone }, interaction, 'timezone', {
			timezone: await resolveKey(interaction, `commands/config:timezone.choices.${timezone}`),
		});
	}

	public async updateConfig<T extends NonNullObject = StringMap>(
		update: Omit<Prisma.XOR<Prisma.GuildCreateInput, Prisma.GuildUncheckedCreateInput>, 'guildId'>,
		interaction: Subcommand.ChatInputCommandInteraction<'cached'>,
		key: string,
		options?: TOptions<T>,
	) {
		await this.container.prisma.guild.upsert({
			create: { guildId: interaction.guildId, ...update },
			where: { guildId: interaction.guildId },
			update: { ...update },
		});

		return interactionSuccess(interaction, `commands/config:${key}.success`, options);
	}
}

export const ConfigApplicationCommandMentions = {
	AnnouncementChannel: chatInputApplicationCommandMention('config', 'announcement-channel', '935174203882217483'),
	AnnouncementMessage: chatInputApplicationCommandMention('config', 'announcement-message', '935174203882217483'),
	BirthdayRole: chatInputApplicationCommandMention('config', 'birthday-role', '935174203882217483'),
	List: chatInputApplicationCommandMention('config', 'list', '935174203882217483'),
	OverviewChannel: chatInputApplicationCommandMention('overview-channel', 'remove', '935174203882217483'),
	PingRole: chatInputApplicationCommandMention('config', 'ping-role', '935174203882217483'),
	Reset: chatInputApplicationCommandMention('config', 'reset', '935174203882217483'),
	Timezone: chatInputApplicationCommandMention('config', 'timezone', '935174203882217483'),
} as const;

function registerConfigCommand(builder: SlashCommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:config')
		.setDefaultMemberPermissions(defaultUserPermissions.add('ManageRoles').bitfield)
		.setDMPermission(false)
		.addSubcommand((builder) => announcementChannelConfigSubCommand(builder))
		.addSubcommand((builder) => annoncementMessageConfigSubCommand(builder))
		.addSubcommand((builder) => birthdayRoleConfigSubCommand(builder))
		.addSubcommand((builder) => listConfigSubCommand(builder))
		.addSubcommand((builder) => overviewChannelConfigSubCommand(builder))
		.addSubcommand((builder) => pingRoleConfigSubCommand(builder))
		.addSubcommand((builder) => resetConfigSubCommand(builder))
		.addSubcommand((builder) => timezoneConfigSubCommand(builder));
}

function announcementChannelConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:announcementChannel').addChannelOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:announcementChannel.channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);
}

function annoncementMessageConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:announcementMessage').addStringOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:announcementMessage.message')
			.setMinLength(1)
			.setMaxLength(512)
			.setRequired(true),
	);
}

function birthdayRoleConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:birthdayRole').addRoleOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:birthdayRole.role').setRequired(true),
	);
}

function listConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:list');
}

function overviewChannelConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:overviewChannel').addChannelOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:overviewChannel.channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);
}

function pingRoleConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:pingRole').addRoleOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:pingRole.role').setRequired(true),
	);
}

function resetConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:reset').addStringOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:reset.config')
			.addChoices(
				createLocalizedChoice('commands/config:reset.choices.birthdayRole', { value: 'birthdayRole' }),
				createLocalizedChoice('commands/config:reset.choices.birthdayPingRole', { value: 'birthdayPingRole' }),
				createLocalizedChoice('commands/config:reset.choices.announcementChannel', {
					value: 'announcementChannel',
				}),
				createLocalizedChoice('commands/config:reset.choices.announcementMessage', {
					value: 'announcementMessage',
				}),
				createLocalizedChoice('commands/config:reset.choices.overviewChannel', { value: 'overviewChannel' }),
				createLocalizedChoice('commands/config:reset.choices.timezone', { value: 'timezone' }),
				createLocalizedChoice('commands/config:reset.choices.logChannel', { value: 'logChannel' }),
			)
			.setRequired(true),
	);
}

function timezoneConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:timezone').addIntegerOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:timezone.timezone')
			.addChoices(
				createLocalizedChoice('commands/config:timezone.choices.-11', { value: -11 }),
				createLocalizedChoice('commands/config:timezone.choices.-10', { value: -10 }),
				createLocalizedChoice('commands/config:timezone.choices.-9', { value: -9 }),
				createLocalizedChoice('commands/config:timezone.choices.-8', { value: -8 }),
				createLocalizedChoice('commands/config:timezone.choices.-7', { value: -7 }),
				createLocalizedChoice('commands/config:timezone.choices.-6', { value: -6 }),
				createLocalizedChoice('commands/config:timezone.choices.-5', { value: -5 }),
				createLocalizedChoice('commands/config:timezone.choices.-4', { value: -4 }),
				createLocalizedChoice('commands/config:timezone.choices.-3', { value: -3 }),
				createLocalizedChoice('commands/config:timezone.choices.-2', { value: -2 }),
				createLocalizedChoice('commands/config:timezone.choices.-1', { value: -1 }),
				createLocalizedChoice('commands/config:timezone.choices.0', { value: 0 }),
				createLocalizedChoice('commands/config:timezone.choices.1', { value: 1 }),
				createLocalizedChoice('commands/config:timezone.choices.2', { value: 2 }),
				createLocalizedChoice('commands/config:timezone.choices.3', { value: 3 }),
				createLocalizedChoice('commands/config:timezone.choices.4', { value: 4 }),
				createLocalizedChoice('commands/config:timezone.choices.5', { value: 5 }),
				createLocalizedChoice('commands/config:timezone.choices.6', { value: 6 }),
				createLocalizedChoice('commands/config:timezone.choices.7', { value: 7 }),
				createLocalizedChoice('commands/config:timezone.choices.8', { value: 8 }),
				createLocalizedChoice('commands/config:timezone.choices.9', { value: 9 }),
				createLocalizedChoice('commands/config:timezone.choices.10', { value: 10 }),
				createLocalizedChoice('commands/config:timezone.choices.11', { value: 11 }),
				createLocalizedChoice('commands/config:timezone.choices.12', { value: 12 }),
			)
			.setRequired(true),
	);
}
