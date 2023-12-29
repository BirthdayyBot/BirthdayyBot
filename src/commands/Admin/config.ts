import { BIRTHDAYY_CUPCAKE } from '#lib/components/images';
import { CustomSubCommand } from '#lib/structures/commands/CustomCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { TIMEZONE_VALUES } from '#lib/utils/common/date';
import { formatBirthdayMessage } from '#lib/utils/common/string';
import { BrandingColors } from '#lib/utils/constants';
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
	EmbedField,
	PermissionFlagsBits,
	Role,
	channelMention,
	chatInputApplicationCommandMention,
	inlineCode,
	roleMention,
} from 'discord.js';

type ConfigDefault = Omit<
	Required<Guild>,
	'guildId' | 'logChannel' | 'inviter' | 'language' | 'lastUpdated' | 'disabled' | 'premium'
>;

@ApplyOptions<CustomSubCommand.Options>({
	name: 'config',
	description: 'commands/config:description',
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

		const birthdayRole = interaction.options.getRole('birthdayRole');
		if (!isNullish(birthdayRole)) {
			const result = await this.parseRole(interaction, birthdayRole, false);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayRole', result.unwrap()]);
		}

		const birthdayPingRole = interaction.options.getRole('birthdayPingRole');
		if (!isNullish(birthdayPingRole)) {
			const result = await this.parseRole(interaction, birthdayPingRole, true);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayPingRole', result.unwrap()]);
		}

		const overviewChannel = interaction.options.getChannel('overviewChannel');
		if (!isNullish(overviewChannel)) {
			const result = await this.parseChannel(interaction, overviewChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['overviewChannel', result.unwrap()]);
		}

		const timezone = interaction.options.getInteger('timezone');
		if (!isNullish(timezone)) entries.push(['timezone', timezone]);

		return this.updateDatabase(interaction, Object.fromEntries(entries));
	}

	public async view(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const { guildId } = interaction;
		const settings = await this.container.prisma.guild.findUnique({ where: { guildId } });

		const embed = await this.viewGenerateContent(interaction, settings);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	public reset(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getString('key', true)) {
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
			case 'overviewMessage':
				return this.updateDatabase(interaction, { overviewMessage: null });
			case 'timezone':
				return this.updateDatabase(interaction, { timezone: 0 });
			default:
				return interaction.reply({ content: 'Something went wrong', ephemeral: true });
		}
	}

	public override async autocompleteRun(interaction: Command.AutocompleteInteraction<'cached'>) {
		if (interaction.commandName !== 'config') return interaction.respond([]);
		const focusedOption = interaction.options.getFocused(true);
		if (focusedOption?.name !== 'timezone') return interaction.respond([]);

		const results = Object.entries(TIMEZONE_VALUES).map(([value, name]) => ({ name, value: Number(value) }));
		this.container.logger.debug(JSON.stringify(results));
		return interaction.respond(results);
	}

	private async viewGenerateContent(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		settings?: Partial<Guild> | null,
	) {
		settings ??= {};
		const t = await fetchT(interaction);

		const embed = new EmbedBuilder()
			.setTitle(t('commands/config:viewTitleEmbed'))
			.setColor(BrandingColors.Birthdayy)
			.setThumbnail(BIRTHDAYY_CUPCAKE);

		const announcementChannel = settings.announcementChannel
			? channelMention(settings.announcementChannel)
			: t('globals:unset');

		let announcementMessage = settings.announcementMessage
			? formatBirthdayMessage(settings.announcementMessage, interaction.member)
			: inlineCode(t('globals:unset'));

		if (!settings.premium) {
			const content = await resolveKey(interaction, 'commands/config:viewMessageRequiredPremimAlert');

			announcementMessage += `\n\n${content}`;
		}

		const birthdayRole = settings.birthdayRole ? roleMention(settings.birthdayRole) : t('globals:unset');
		const birthdayPingRole = settings.birthdayPingRole
			? roleMention(settings.birthdayPingRole)
			: t('globals:unset');
		const overviewChannel = settings.overviewChannel
			? channelMention(settings.overviewChannel)
			: t('globals:unset');
		const timezone = settings.timezone ? TIMEZONE_VALUES[settings.timezone] : t('globals:unset');

		return embed.setFields(
			...(t('commands/config:viewFieldsEmbed', {
				returnObjects: true,
				announcementChannel,
				announcementMessage,
				birthdayRole,
				birthdayPingRole,
				overviewChannel,
				timezone,
			}) as EmbedField[]),
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
			ok: () => resolveKey(interaction, 'commands/config:editSuccess'),
			err: (error) => {
				this.container.logger.error(error);
				return resolveKey(interaction, 'commands/config:editFailure');
			},
		});

		return interaction.reply({ content, ephemeral: true });
	}

	private async parseChannel(interaction: Command.ChatInputCommandInteraction<'cached'>, channel: Channel) {
		if (!canSendEmbeds(channel)) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editChannelCanSendEmbeds', {
					channel: channelMention(channel.id),
				}),
			);
		}

		return Result.ok(channel.id);
	}

	private async parseAnnouncementMessage(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		announcementMessage: string,
	) {
		const settings = await this.container.prisma.guild.findUnique({ where: { guildId: interaction.guildId } });

		if (!settings?.premium && announcementMessage !== DEFAULT_ANNOUNCEMENT_MESSAGE) {
			await this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { announcementMessage: DEFAULT_ANNOUNCEMENT_MESSAGE },
			});

			return Result.err(await resolveKey(interaction, 'commands/config:editMessagePremiumRequired'));
		}

		if (announcementMessage.length > 512) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editMessageTooLong', {
					maxLength: 512,
				}),
			);
		}

		return Result.ok(announcementMessage);
	}

	private async parseRole(interaction: Command.ChatInputCommandInteraction<'cached'>, role: Role, mention: boolean) {
		if (role.position >= interaction.guild.members.me!.roles.highest.position) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editRoleHigher', {
					role: roleMention(role.id),
				}),
			);
		}

		// Check if the bot has permissions to add the role to the user:
		if (mention && !role.mentionable) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editRoleNotMentionnable', {
					role: roleMention(role.id),
				}),
			);
		}

		return Result.ok(role.id);
	}
}

export const ConfigApplicationCommandMentions = {
	Edit: chatInputApplicationCommandMention('config', 'edit', '935174203882217483'),
	View: chatInputApplicationCommandMention('config', 'view', '935174203882217483'),
	Reset: chatInputApplicationCommandMention('config', 'reset', '935174203882217483'),
} as const;

function registerConfigCommand(builder: SlashCommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:name', 'commands/config:description')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setDMPermission(false)
		.addSubcommand((builder) => editConfigSubCommand(builder))
		.addSubcommand((builder) => viewConfigSubCommand(builder))
		.addSubcommand((builder) => resetConfigSubCommand(builder));
}

function editConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:edit')
		.addChannelOption((builder) =>
			applyLocalizedBuilder(
				builder,
				'commands/config:keyAnnouncementChannel',
				'commands/config:editOptionsAnnoucementChannelDescription',
			).addChannelTypes(ChannelType.GuildText),
		)
		.addStringOption((builder) =>
			applyLocalizedBuilder(
				builder,
				'commands/config:keyAnnouncementMessage',
				'commands/config:editOptionsAnnoucementMessageDescription',
			)
				.setMinLength(1)
				.setMaxLength(512),
		)
		.addRoleOption((builder) =>
			applyLocalizedBuilder(
				builder,
				'commands/config:keyBirthdayRole',
				'commands/config:editOptionsBirthdayRoleDescription',
			),
		)
		.addRoleOption((builder) =>
			applyLocalizedBuilder(
				builder,
				'commands/config:keyBirthdayPingRole',
				'commands/config:editOptionsBirthdayPingRoleDescription',
			),
		)
		.addChannelOption((builder) =>
			applyLocalizedBuilder(
				builder,
				'commands/config:keyOverviewChannel',
				'commands/config:editOptionsOverviewChannelDescription',
			).addChannelTypes(ChannelType.GuildText),
		)
		.addIntegerOption((builder) =>
			applyLocalizedBuilder(
				builder,
				'commands/config:keyTimezone',
				'commands/config:editOptionsTimezoneDescription',
			).setAutocomplete(true),
		);
}

function viewConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:view');
}

function resetConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:reset').addStringOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:resetOptionsKey')
			.addChoices(
				createLocalizedChoice('commands/config:resetOptionsKeyChoicesAll', { value: 'all' }),
				createLocalizedChoice('commands/config:keyAnnouncementChannel', {
					value: 'announcementChannel',
				}),
				createLocalizedChoice('commands/config:keyAnnouncementMessage', {
					value: 'announcementMessage',
				}),
				createLocalizedChoice('commands/config:keyBirthdayRole', { value: 'birthdayRole' }),
				createLocalizedChoice('commands/config:keyBirthdayPingRole', {
					value: 'birthdayPingRole',
				}),
				createLocalizedChoice('commands/config:keyOverviewChannel', {
					value: 'overviewChannel',
				}),
				createLocalizedChoice('commands/config:keyTimezone', { value: 'timezone' }),
			)
			.setRequired(true),
	);
}
