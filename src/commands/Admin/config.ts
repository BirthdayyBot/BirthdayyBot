import { getSettings } from '#lib/discord/guild';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { updateBirthdayOverview } from '#lib/utils/birthday/overview';
import { formatBirthdayMessage } from '#lib/utils/common/string';
import { TIMEZONE_VALUES } from '#lib/utils/common/timezone';
import { BrandingColors } from '#lib/utils/constants';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Guild } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { Command, CommandOptionsRunTypeEnum, Result, type ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice, fetchT, resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { Channel, ChannelType, EmbedBuilder, PermissionFlagsBits, Role, channelMention, inlineCode, roleMention } from 'discord.js';

const Root = LanguageKeys.Commands.Config;
type ConfigDefault = Omit<Required<Guild>, 'id' | 'channelsLogs' | 'inviter' | 'language' | 'updatedAt' | 'inDeleteQueue' | 'premium' | 'createdAt'>;

@ApplyOptions<BirthdayySubcommand.Options>({
	description: Root.RootDescription,
	detailedDescription: Root.RootExtended,
	subcommands: [
		{ name: 'edit', chatInputRun: 'runEdit' },
		{ name: 'view', chatInputRun: 'runView' },
		{ name: 'reset', chatInputRun: 'runReset' }
	],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Manager
})
export class UserCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			this.registerSubcommands(builder) //
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				.setDMPermission(false)
		);
	}

	public async runEdit(interaction: Command.ChatInputCommandInteraction<'cached'>) {
		const entries: [keyof Guild, Guild[keyof Guild]][] = [];

		const announcementChannel = interaction.options.getChannel('announcement-channel');
		if (!isNullish(announcementChannel)) {
			const result = await this.parseChannel(interaction, announcementChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['channelsAnnouncement', result.unwrap()]);
		}

		const announcementMessage = interaction.options.getString('announcement-message');
		if (!isNullish(announcementMessage)) {
			const result = await this.parseAnnouncementMessage(interaction, announcementMessage);

			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['messagesAnnouncement', result.unwrap()]);
		}

		const birthdayRole = interaction.options.getRole('birthday-role');
		if (!isNullish(birthdayRole)) {
			const result = await this.parseRole(interaction, birthdayRole, false);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['rolesBirthday', result.unwrap()]);
		}

		const birthdayPingRole = interaction.options.getRole('birthday-ping-role');
		if (!isNullish(birthdayPingRole)) {
			const result = await this.parseRole(interaction, birthdayPingRole, true);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['rolesNotified', result.unwrap()]);
		}

		const overviewChannel = interaction.options.getChannel('overview-channel');
		if (!isNullish(overviewChannel)) {
			const result = await this.parseChannel(interaction, overviewChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			await updateBirthdayOverview(interaction.guild);

			entries.push(['channelsOverview', result.unwrap()]);
		}

		const timezone = interaction.options.getInteger('timezone');
		if (!isNullish(timezone)) entries.push(['timezone', Number(timezone)]);

		return this.updateDatabase(interaction, Object.fromEntries(entries));
	}

	public async runView(interaction: BirthdayySubcommand.Interaction) {
		const { id } = interaction.guild;
		const settings = await this.container.prisma.guild.findUnique({ where: { id } });

		const content = await this.viewGenerateContent(interaction, settings);

		const embed = new EmbedBuilder().setDescription(content).setColor(BrandingColors.Primary);

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	public runReset(interaction: BirthdayySubcommand.Interaction) {
		const key = interaction.options.getString('key', true) as ResetOptions;
		switch (key) {
			case 'all': {
				const data: ConfigDefault = {
					channelsAnnouncement: null,
					messagesAnnouncement: null,
					rolesBirthday: null,
					rolesNotified: null,
					channelsOverview: null,
					messagesOverview: null,
					timezone: 0
				};
				return this.updateDatabase(interaction, data);
			}
			case 'channels-announcement':
				return this.updateDatabase(interaction, { channelsAnnouncement: null });
			case 'messages-announcement':
				return this.updateDatabase(interaction, { messagesAnnouncement: null });
			case 'roles-birthday':
				return this.updateDatabase(interaction, { rolesBirthday: null });
			case 'roles-notified':
				return this.updateDatabase(interaction, { rolesNotified: null });
			case 'channels-overview':
				return this.updateDatabase(interaction, { channelsOverview: null, messagesOverview: null });
			case 'timezone':
				return this.updateDatabase(interaction, { timezone: 0 });
		}
	}

	private async viewGenerateContent(interaction: Command.ChatInputCommandInteraction<'cached'>, settings?: Partial<Guild> | null) {
		settings ??= {};

		const t = await fetchT(interaction);
		const Unset = inlineCode(t(LanguageKeys.Shared.Unset));

		const announcementChannel = settings.channelsAnnouncement ? channelMention(settings.channelsAnnouncement) : t('globals:unset');
		const announcementMessage = settings.messagesAnnouncement ? formatBirthdayMessage(settings.messagesAnnouncement, interaction.member) : Unset;
		const birthdayRole = settings.rolesBirthday ? roleMention(settings.rolesBirthday) : Unset;
		const birthdayPingRole = settings.rolesNotified ? roleMention(settings.rolesNotified) : Unset;
		const overviewChannel = settings.channelsOverview ? channelMention(settings.channelsOverview) : Unset;
		const timezone = settings.timezone ? TIMEZONE_VALUES[settings.timezone] : Unset;

		return t(Root.ViewContent, {
			announcementChannel,
			announcementMessage,
			birthdayRole,
			birthdayPingRole,
			overviewChannel,
			timezone
		});
	}

	private async updateDatabase(interaction: Command.ChatInputCommandInteraction<'cached'>, data: Partial<Guild>) {
		const { id } = interaction.guild;
		const result = await Result.fromAsync(
			this.container.prisma.guild.upsert({ where: { id }, create: { id, ...data }, update: data, select: null })
		);

		const t = getSupportedUserLanguageT(interaction);

		const content = result.match({
			ok: () => t(Root.EditSuccess),
			err: (error) => {
				this.container.logger.error(error);
				return t(Root.EditFailure);
			}
		});

		const embed = new EmbedBuilder().setDescription(content).setColor(BrandingColors.Primary);

		return interaction.reply({ embeds: [embed], ephemeral: true });
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

	private async parseAnnouncementMessage(interaction: Command.ChatInputCommandInteraction<'cached'>, announcementMessage: string) {
		const settingsManager = getSettings(interaction.guildId);
		const settings = await settingsManager.fetch();
		const defaultAnnouncementMessage = settingsManager.defaultKey.messagesAnnouncement;

		if (!settings?.premium && announcementMessage !== defaultAnnouncementMessage) {
			await this.container.prisma.guild.update({
				where: { id: interaction.guildId },
				data: { messagesAnnouncement: defaultAnnouncementMessage }
			});

			return Result.err(await resolveKey(interaction, 'commands/config:editMessagePremiumRequired'));
		}

		if (announcementMessage.length > 200) {
			return Result.err(
				await resolveKey(interaction, 'commands/config:editMessageTooLong', {
					maxLength: 200
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
				await resolveKey(interaction, 'commands/config:editRoleNotMentionnable', {
					role: roleMention(role.id)
				})
			);
		}

		return Result.ok(role.id);
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return applyLocalizedBuilder(builder, Root.RootName)
			.addSubcommand((subcommand) => this.registerEditCommand(subcommand))
			.addSubcommand((subcommand) => this.registerViewCommand(subcommand))
			.addSubcommand((subcommand) => this.registerResetCommand(subcommand));
	}

	private registerEditCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, Root.Edit)
			.addChannelOption((builder) =>
				applyLocalizedBuilder(builder, Root.KeyAnnouncementChannel, Root.EditOptionsAnnouncementChannelDescription).addChannelTypes(
					ChannelType.GuildText
				)
			)
			.addStringOption((builder) =>
				applyLocalizedBuilder(builder, Root.KeyAnnouncementMessage, Root.EditOptionsAnnouncementMessageDescription)
					.setMinLength(1)
					.setMaxLength(512)
			)
			.addRoleOption((builder) => applyLocalizedBuilder(builder, Root.KeyBirthdayRole, Root.EditOptionsBirthdayRoleDescription))
			.addRoleOption((builder) => applyLocalizedBuilder(builder, Root.KeyBirthdayPingRole, Root.EditOptionsBirthdayPingRoleDescription))
			.addChannelOption((builder) =>
				applyLocalizedBuilder(builder, Root.KeyOverviewChannel, Root.EditOptionsOverviewChannelDescription).addChannelTypes(
					ChannelType.GuildText
				)
			)
			.addIntegerOption((builder) =>
				applyLocalizedBuilder(builder, Root.KeyTimezone, Root.EditOptionsTimezoneDescription).setAutocomplete(true)
			);
	}

	private registerViewCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, Root.View);
	}

	private registerResetCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, Root.Reset).addStringOption((builder) =>
			applyLocalizedBuilder(builder, Root.ResetOptionsKey)
				.addChoices(
					createLocalizedChoice(Root.ResetOptionsKeyChoicesAll, { value: 'all' }),
					createLocalizedChoice(Root.KeyAnnouncementChannel, { value: 'channels-announcement' }),
					createLocalizedChoice(Root.KeyAnnouncementMessage, { value: 'messages-announcement' }),
					createLocalizedChoice(Root.KeyBirthdayRole, { value: 'roles-birthday' }),
					createLocalizedChoice(Root.KeyBirthdayPingRole, { value: 'roles-notified' }),
					createLocalizedChoice(Root.KeyOverviewChannel, { value: 'channels-overview' }),
					createLocalizedChoice(Root.KeyTimezone, { value: 'timezone' })
				)
				.setRequired(true)
		);
	}
}

interface EditOptions {
	'channels-announcement': string;
	'messages-announcement': string;
	'roles-birthday': string;
	'roles-notified': string;
	'channels-overview': string;
	timezone: number;
}

type ResetOptions = 'all' | keyof EditOptions;
