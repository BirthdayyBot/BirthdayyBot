import { CustomSubCommand } from '#lib/structures/commands/CustomCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { updateBirthdayOverview } from '#lib/utils/birthday/overview';
import { TIMEZONE_VALUES } from '#lib/utils/common/date';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#lib/utils/environment';
import { createSubcommandMappings } from '#utils/utils';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Guild } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { Command, CommandOptionsRunTypeEnum, Result, type ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice, fetchT, resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import {
	Channel,
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	Role,
	channelMention,
	chatInputApplicationCommandMention,
	hyperlink,
	inlineCode,
	messageLink,
	roleMention,
} from 'discord.js';

type ConfigDefault = Omit<
	Required<Guild>,
	'guildId' | 'logChannel' | 'inviter' | 'language' | 'lastUpdated' | 'disabled' | 'premium'
>;

@ApplyOptions<CustomSubCommand.Options>({
	subcommands: createSubcommandMappings('edit', 'view', 'reset'),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Administrator,
})
export class ConfigCommand extends CustomSubCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => registerConfigCommand(builder), {
			guildIds: ['980559116076470272'],
		});
	}

	public async edit(interaction: Command.ChatInputCommandInteraction<'cached'>) {
		const entries: [keyof Guild, Guild[keyof Guild]][] = [];

		// Reactions have an extra validation step, so it will run the first to prevent needless processing:
		const announcementChannel = interaction.options.getChannel('announcement-channel');
		if (!isNullish(announcementChannel)) {
			const result = await this.parseAnnouncementChannel(interaction, announcementChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['announcementChannel', result.unwrap()]);
		}

		const announcementMessage = interaction.options.getString('announcement-message');
		if (!isNullish(announcementMessage)) {
			const result = await this.parseAnnouncementMessage(interaction, announcementMessage);

			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['announcementMessage', result.unwrap()]);
		}

		const birthdayRole = interaction.options.getRole('birthday-role');
		if (!isNullish(birthdayRole)) {
			const result = await this.parseBirthdayRole(interaction, birthdayRole);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayRole', result.unwrap()]);
		}

		const birthdayPingRole = interaction.options.getRole('birthday-ping-role');
		if (!isNullish(birthdayPingRole)) {
			const result = await this.parseBirthdayPingRole(interaction, birthdayPingRole);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayPingRole', result.unwrap()]);
		}

		const overviewChannel = interaction.options.getChannel('overview-channel');
		if (!isNullish(overviewChannel)) {
			const result = await this.parseOverviewChannel(interaction, overviewChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['overviewChannel', result.unwrap()]);
		}

		const timezone = interaction.options.getInteger('timezone');
		if (!isNullish(timezone)) {
			const result = await this.parseTimezone(interaction, timezone);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['timezone', result.unwrap()]);
		}

		return this.updateDatabase(interaction, Object.fromEntries(entries));
	}

	public async view(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { guildId } = interaction;
		const settings = await this.container.prisma.guild.findUnique({ where: { guildId } });

		const embed = await this.viewGenerateContent(interaction, settings);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	public reset(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.data[0].name) {
			case 'all': {
				const data: ConfigDefault = {
					announcementChannel: null,
					announcementMessage: DEFAULT_ANNOUNCEMENT_MESSAGE,
					birthdayRole: null,
					birthdayPingRole: null,
					overviewChannel: null,
					overviewMessage: null,
					timezone: 0,
				};
				return this.updateDatabase(interaction, data);
			}
			case 'announcementChannel':
				return this.updateDatabase(interaction, { announcementChannel: null });
			case 'announcementMessage':
				return this.updateDatabase(interaction, { announcementMessage: DEFAULT_ANNOUNCEMENT_MESSAGE });
			case 'birthdayRole':
				return this.updateDatabase(interaction, { birthdayRole: null });
			case 'birthdayPingRole':
				return this.updateDatabase(interaction, { birthdayPingRole: null });
			case 'overviewChannel':
				return this.updateDatabase(interaction, { overviewChannel: null, overviewMessage: null });
			case 'timezone':
				return this.updateDatabase(interaction, { timezone: 0 });
			default: {
				return this.updateDatabase(interaction, {});
			}
		}
	}

	private async viewGenerateContent(
		interaction: Command.ChatInputCommandInteraction,
		settings?: Partial<Guild> | null,
	) {
		settings ??= {};
		const t = await fetchT(interaction);

		const embed = new EmbedBuilder().setTitle(t('commands/config:view.title'));

		const yesNo = [inlineCode(t('globals:no')), inlineCode(t('globals:yes'))];

		const announcementChannel = settings.announcementChannel
			? hyperlink('Here', channelMention(settings.announcementChannel))
			: inlineCode(t('globals:unset'));
		const announcementMessage =
			settings.announcementMessage && settings.announcementChannel
				? messageLink(settings.announcementChannel, settings.announcementMessage)
				: inlineCode(t('globals:unset'));
		const birthdayRole = settings.birthdayRole
			? roleMention(settings.birthdayRole)
			: inlineCode(t('globals:unset'));
		const birthdayPingRole = settings.birthdayPingRole
			? roleMention(settings.birthdayPingRole)
			: inlineCode(t('globals:unset'));
		const overviewChannel = settings.overviewChannel
			? channelMention(settings.overviewChannel)
			: inlineCode(t('globals:unset'));
		const timezone = settings.timezone ? TIMEZONE_VALUES[settings.timezone] : inlineCode(t('globals:unset'));

		const premium = yesNo[Number(settings.premium ?? false)];

		return embed.addFields(
			{ name: t('commands/config:view.fields.channel'), value: announcementChannel, inline: true },
			{ name: t('commands/config:view.fields.message'), value: announcementMessage, inline: true },
			{ name: t('commands/config:view.fields.birthdayRole'), value: birthdayRole, inline: true },
			{ name: t('commands/config:view.fields.birthdayPingRole'), value: birthdayPingRole },
			{ name: t('commands/config:view.fields.overviewChannel'), value: overviewChannel },
			{ name: t('commands/config:view.fields.timezone'), value: timezone },
			{ name: t('commands/config:view.fields.premium'), value: premium },
		);
	}

	private async updateDatabase(interaction: Command.ChatInputCommandInteraction<'cached'>, data: Partial<Guild>) {
		const { guildId } = interaction;
		const result = await Result.fromAsync(
			this.container.prisma.guild.upsert({
				where: { guildId },
				create: { guildId, ...data },
				update: data,
				select: null,
			}),
		);

		const content = await result.match({
			ok: () => resolveKey(interaction, 'commands/config:reset.success'),
			err: (error) => {
				this.container.logger.error(error);
				return resolveKey(interaction, 'commands/config:reset.error');
			},
		});

		return interaction.reply({ content, ephemeral: true });
	}

	private async parseAnnouncementChannel(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		announcementChannel: Channel,
	) {
		if (announcementChannel.type !== ChannelType.GuildText) {
			return Result.err(await resolveKey(interaction, 'commands/config:announcementChannel.error'));
		}

		// Check if the bot can send messages in the channel:
		if (!canSendEmbeds(announcementChannel)) {
			return Result.err(await resolveKey(interaction, 'commands/config:announcementChannel.error'));
		}

		return Result.ok(announcementChannel.id);
	}

	private async parseAnnouncementMessage(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		announcementMessage: string,
	) {
		if (announcementMessage.length > 512) {
			return Result.err(await resolveKey(interaction, 'commands/config:announcementMessage.error'));
		}

		return Result.ok(announcementMessage);
	}

	private async parseBirthdayRole(interaction: Command.ChatInputCommandInteraction<'cached'>, birthdayRole: Role) {
		// Check if the bot has permissions to add the role to the user:
		if (!birthdayRole.editable) {
			return Result.err(await resolveKey(interaction, 'commands/config:birthdayRole.error'));
		}

		return Result.ok(birthdayRole.id);
	}

	private async parseBirthdayPingRole(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		birthdayPingRole: Role,
	) {
		// Check if the bot has permissions to add the role to the user:
		if (!birthdayPingRole.editable) {
			return Result.err(await resolveKey(interaction, 'commands/config:birthdayPingRole.error'));
		}

		return Result.ok(birthdayPingRole.id);
	}

	private async parseOverviewChannel(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		overviewChannel: Channel,
	) {
		if (overviewChannel.type !== ChannelType.GuildText) {
			return Result.err(await resolveKey(interaction, 'commands/config:overviewChannel.error'));
		}

		// Check if the bot can send messages in the channel:
		if (!canSendEmbeds(overviewChannel)) {
			return Result.err(await resolveKey(interaction, 'commands/config:overviewChannel.error'));
		}

		await updateBirthdayOverview(interaction.guildId);

		return Result.ok(overviewChannel.id);
	}

	private async parseTimezone(interaction: Command.ChatInputCommandInteraction<'cached'>, timezone: number) {
		if (!TIMEZONE_VALUES[timezone]) {
			return Result.err(await resolveKey(interaction, 'commands/config:timezone.error'));
		}

		return Result.ok(timezone);
	}
}

export const ConfigApplicationCommandMentions = {
	Edit: chatInputApplicationCommandMention('config', 'edit', '935174203882217483'),
	View: chatInputApplicationCommandMention('config', 'view', '935174203882217483'),
	Reset: chatInputApplicationCommandMention('config', 'reset', '935174203882217483'),
} as const;

function registerConfigCommand(builder: SlashCommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:config')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setDMPermission(false)
		.addSubcommand((builder) => editConfigSubCommand(builder))
		.addSubcommand((builder) => viewConfigSubCommand(builder))
		.addSubcommand((builder) => resetConfigSubCommand(builder));
}

function editConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:edit')
		.addChannelOption((builder) =>
			applyLocalizedBuilder(builder, 'commands/config:announcementChannel.channel')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true),
		)
		.addStringOption((builder) =>
			applyLocalizedBuilder(builder, 'commands/config:announcementMessage.message')
				.setMinLength(1)
				.setMaxLength(512)
				.setRequired(true),
		)
		.addRoleOption((builder) =>
			applyLocalizedBuilder(builder, 'commands/config:birthdayRole.role').setRequired(true),
		)
		.addRoleOption((builder) => applyLocalizedBuilder(builder, 'commands/config:pingRole.role').setRequired(true))
		.addChannelOption((builder) =>
			applyLocalizedBuilder(builder, 'commands/config:overviewChannel.channel')
				.addChannelTypes(ChannelType.GuildText)
				.setRequired(true),
		)
		.addIntegerOption((builder) =>
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

function viewConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:list');
}

function resetConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:reset').addStringOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:reset.options.key')
			.addChoices(
				createLocalizedChoice('commands/config:reset.options.key.all', { value: 'all' }),
				createLocalizedChoice('commands/config:reset.options.key.announcementChannel', {
					value: 'announcementChannel',
				}),
				createLocalizedChoice('commands/config:reset.options.key.announcementMessage', {
					value: 'announcementMessage',
				}),
				createLocalizedChoice('commands/config:reset.options.key.birthdayRole', { value: 'birthdayRole' }),
				createLocalizedChoice('commands/config:reset.options.key.birthdayPingRole', {
					value: 'birthdayPingRole',
				}),
				createLocalizedChoice('commands/config:reset.options.key.overviewChannel', {
					value: 'overviewChannel',
				}),
				createLocalizedChoice('commands/config:reset.options.key.timezone', { value: 'timezone' }),
			)
			.setRequired(true),
	);
}
