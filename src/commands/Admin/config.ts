import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#root/config';
import { TIMEZONE_VALUES, formatBirthdayMessage } from '#utils/common';
import { generateDefaultEmbed } from '#utils/embed';
import { getSettings } from '#utils/functions';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import type { Guild } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { Command, CommandOptionsRunTypeEnum, Result, type ApplicationCommandRegistry } from '@sapphire/framework';
import {
	applyDescriptionLocalizedBuilder,
	applyLocalizedBuilder,
	createLocalizedChoice,
	fetchT,
	resolveKey
} from '@sapphire/plugin-i18next';
import { isNullOrUndefined, isNullOrUndefinedOrEmpty, isNullish, objectEntries } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import {
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	Role,
	SlashCommandBuilder,
	channelMention,
	chatInputApplicationCommandMention,
	roleMention,
	type Channel,
	type EmbedField
} from 'discord.js';

@ApplyOptions<BirthdayySubcommand.Options>({
	subcommands: [
		{ name: 'edit', chatInputRun: 'chatInputRunEdit' },
		{ name: 'view', chatInputRun: 'chatInputRunView' },
		{ name: 'reset', chatInputRun: 'chatInputRunReset' }
	],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Administrator
})
export class ConfigCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			this.registerSubcommands(
				applyDescriptionLocalizedBuilder(builder, 'commands/config:description')
					.setName('config')
					.setDMPermission(false)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			)
		);
	}

	public async chatInputRunEdit(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const entries: [keyof Guild, Guild[keyof Guild]][] = [];

		const announcementChannel = interaction.options.getChannel('announcement-channel');
		if (!isNullish(announcementChannel)) {
			const result = await this.parseChannel(interaction, announcementChannel);
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
			const result = await this.parseRole(interaction, birthdayRole, false);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayRole', result.unwrap()]);
		}

		const birthdayPingRole = interaction.options.getRole('birthday-ping-role');
		if (!isNullish(birthdayPingRole)) {
			const result = await this.parseRole(interaction, birthdayPingRole, true);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayPingRole', result.unwrap()]);
		}

		const overviewChannel = interaction.options.getChannel('overview-channel');
		if (!isNullish(overviewChannel)) {
			const result = await this.parseChannel(interaction, overviewChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['overviewChannel', result.unwrap()]);
		}

		const timezone = interaction.options.getInteger('timezone');
		if (!isNullish(timezone)) entries.push(['timezone', Number(timezone)]);

		return this.updateDatabase(interaction, Object.fromEntries(entries));
	}

	public async chatInputRunView(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const { guildId } = interaction;
		const settings = await this.container.prisma.guild.findUnique({ where: { guildId } });

		const embed = await this.viewGenerateContent(interaction, settings);
		return interaction.reply({ embeds: [generateDefaultEmbed(embed)], ephemeral: true });
	}

	public chatInputRunReset(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const key = interaction.options.getString('key', true) as ResetConfig;
		switch (key) {
			case 'all': {
				const data: Partial<Guild> = {
					announcementChannel: null,
					announcementMessage: null,
					birthdayRole: null,
					birthdayPingRole: null,
					overviewChannel: null,
					overviewMessage: null,
					timezone: 0
				};
				return this.updateDatabase(interaction, data);
			}
			case 'announcementChannel':
				return this.updateDatabase(interaction, { announcementChannel: null });
			case 'announcementMessage':
				return this.updateDatabase(interaction, { announcementMessage: null });
			case 'birthdayRole':
				return this.updateDatabase(interaction, { birthdayRole: null });
			case 'birthdayPingRole':
				return this.updateDatabase(interaction, { birthdayPingRole: null });
			case 'overviewChannel':
				return this.updateDatabase(interaction, { overviewChannel: null, overviewMessage: null });
			case 'timezone':
				return this.updateDatabase(interaction, { timezone: 0 });
		}
	}

	private async viewGenerateContent(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		settings?: Partial<Guild> | null,
		modified = false
	) {
		settings ??= {};
		const t = await fetchT(interaction);
		if (interaction.guild === null) throw new Error('Guild not found');

		this.container.logger.debug(settings);

		const embed = new EmbedBuilder()
			.setTitle(
				t(modified ? 'commands/config:viewTitleEmbedModified' : 'commands/config:viewTitleEmbed', {
					guildName: interaction.guild.name
				})
			)
			.setThumbnail(interaction.guild.iconURL())
			.setDescription(t('commands/config:viewEmbedDescription'));

		const announcementChannel = settings.announcementChannel
			? channelMention(settings.announcementChannel)
			: t('globals:unset');
		//
		const defaultAnnouncementMessage =
			settings.premium && !settings.announcementMessage
				? DEFAULT_ANNOUNCEMENT_MESSAGE
				: t('commands/config:viewMessageRequiredPremiumAlert');

		const formattedBirthdayMessage =
			settings.premium && settings.announcementMessage
				? formatBirthdayMessage(settings.announcementMessage, interaction.member)
				: defaultAnnouncementMessage;
		const announcementMessage =
			formattedBirthdayMessage.length > 512
				? t('commands/config:viewMessageTooLong', { maxLength: 512 })
				: formattedBirthdayMessage;

		if (settings.announcementMessage && settings.announcementMessage.length > 512) {
			embed.setDescription(t('commands/config:viewMessageTooLong', { maxLength: 512 }));
		}

		const birthdayRole = settings.birthdayRole ? roleMention(settings.birthdayRole) : t('globals:unset');
		const birthdayPingRole = settings.birthdayPingRole
			? roleMention(settings.birthdayPingRole)
			: t('globals:unset');
		const overviewChannel = settings.overviewChannel
			? channelMention(settings.overviewChannel)
			: t('globals:unset');
		const timezone = isNullOrUndefined(settings.timezone) ? t('globals:unset') : TIMEZONE_VALUES[settings.timezone];
		const premium = settings.premium ? t('globals:yes') : t('globals:no');

		embed.setFields(
			...(t('commands/config:viewFieldsEmbed', {
				returnObjects: true,
				announcementChannel,
				announcementMessage,
				birthdayRole,
				birthdayPingRole,
				premium,
				overviewChannel,
				timezone
			}) satisfies EmbedField[])
		);
		return embed.toJSON();
	}

	private async updateDatabase(interaction: Command.ChatInputCommandInteraction<'cached'>, data: Partial<Guild>) {
		const { guildId } = interaction;
		const result = await Result.fromAsync(
			this.container.prisma.guild.upsert({
				where: { guildId },
				create: { guildId, ...data },
				update: data,
				select: null
			})
		);

		const content = await result.match({
			ok: async (settings) =>
				this.viewGenerateContent(interaction, settings, !isNullOrUndefinedOrEmpty(objectEntries(data))),
			err: (error) => {
				this.container.logger.error(error);
				return resolveKey(interaction, 'commands/config:editFailure');
			}
		});

		const options = typeof content === 'string' ? { content } : { embeds: [content] };

		return interaction.reply({ ...options, ephemeral: true });
	}

	private async parseChannel(interaction: Command.ChatInputCommandInteraction<'cached'>, channel: Channel) {
		if (!canSendEmbeds(channel)) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editChannelCanSendEmbeds', {
					channel: channelMention(channel.id)
				})
			);
		}

		return Result.ok(channel.id);
	}

	private async parseAnnouncementMessage(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		announcementMessage: string
	) {
		const settingsManager = getSettings(interaction.guildId);
		const settings = await settingsManager.fetch();

		if (!settings?.premium) {
			await this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { announcementMessage: null }
			});

			return Result.err(await resolveKey(interaction, 'commands/config:editMessagePremiumRequired'));
		}

		if (announcementMessage.length > 512) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editMessageTooLong', {
					maxLength: 512
				})
			);
		}

		return Result.ok(announcementMessage);
	}

	private async parseRole(interaction: Command.ChatInputCommandInteraction<'cached'>, role: Role, mention: boolean) {
		if (role.position >= interaction.guild.members.me!.roles.highest.position) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editRoleHigher', {
					role: roleMention(role.id)
				})
			);
		}

		// Check if the bot has permissions to add the role to the user:
		if (mention && !role.mentionable) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editRoleNotMentionable', {
					role: roleMention(role.id)
				})
			);
		}

		return Result.ok(role.id);
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return builder
			.addSubcommand((builder) => this.registerEditSubcommand(builder))
			.addSubcommand((builder) => this.registerViewSubcommand(builder))
			.addSubcommand((builder) => this.registerResetSubcommand(builder));
	}

	private registerEditSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/config:editDescription')
			.setName('edit')
			.addChannelOption((builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/config:editOptionsAnnouncementChannelDescription')
					.setName('announcement-channel')
					.addChannelTypes(ChannelType.GuildText)
			)
			.addStringOption((builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/config:editOptionsAnnouncementMessageDescription')
					.setName('announcement-message')
					.setMinLength(1)
					.setMaxLength(512)
			)
			.addRoleOption((builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/config:editOptionsBirthdayRoleDescription') //
					.setName('birthday-role')
			)
			.addRoleOption((builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/config:editOptionsBirthdayPingRoleDescription') //
					.setName('birthday-ping-role')
			)
			.addChannelOption((builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/config:editOptionsOverviewChannelDescription')
					.setName('overview-channel')
					.addChannelTypes(ChannelType.GuildText)
			)
			.addIntegerOption((builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/config:editOptionsTimezoneDescription')
					.setName('timezone')
					.setAutocomplete(true)
			);
	}

	private registerViewSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/config:viewDescription').setName('view');
	}

	private registerResetSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/config:resetDescription')
			.setName('reset')
			.addStringOption((builder) =>
				applyLocalizedBuilder(builder, 'commands/config:resetOptionsKey')
					.setRequired(true)
					.setChoices(
						createLocalizedChoice('commands/config:resetOptionsKeyChoicesAll', { value: 'all' }),
						createLocalizedChoice('commands/config:keyAnnouncementChannel', {
							value: 'announcementChannel'
						}),
						createLocalizedChoice('commands/config:keyAnnouncementMessage', {
							value: 'announcementMessage'
						}),
						createLocalizedChoice('commands/config:keyBirthdayRole', { value: 'birthdayRole' }),
						createLocalizedChoice('commands/config:keyBirthdayPingRole', {
							value: 'birthdayPingRole'
						}),
						createLocalizedChoice('commands/config:keyOverviewChannel', {
							value: 'overviewChannel'
						}),
						createLocalizedChoice('commands/config:keyTimezone', { value: 'timezone' })
					)
			);
	}
}

export const ConfigApplicationCommandMentions = {
	Edit: chatInputApplicationCommandMention('config', 'edit', envParseString('COMMANDS_CONFIG_ID')),
	View: chatInputApplicationCommandMention('config', 'view', envParseString('COMMANDS_CONFIG_ID')),
	Reset: chatInputApplicationCommandMention('config', 'reset', envParseString('COMMANDS_CONFIG_ID'))
} as const;

interface EditConfig {
	announcementChannel: string | null;
	announcementMessage?: string;
	birthdayRole: string | null;
	birthdayPingRole: string | null;
	overviewChannel: string | null;
	timezone: number;
}

type ResetConfig = 'all' | keyof EditConfig;
