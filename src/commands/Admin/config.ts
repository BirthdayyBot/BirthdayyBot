import { getBirthdays, getSettings } from '#lib/discord/guild';
import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { formatBirthdayMessage } from '#lib/utils/common/string';
import { TIMEZONE_VALUES } from '#lib/utils/common/timezone';
import { BrandingColors } from '#lib/utils/constants';
import { getFooterAuthor } from '#utils/utils';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { Guild } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { type ApplicationCommandRegistry, Command, CommandOptionsRunTypeEnum, Result } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { Channel, ChannelType, EmbedBuilder, PermissionFlagsBits, Role, channelMention, inlineCode, roleMention } from 'discord.js';

const Key = {
	ChannelsAnnouncement: 'commands/config:keyChannelsAnnouncement',
	ChannelsOverview: 'commands/config:keyChannelsOverview',
	MessagesAnnouncement: 'commands/config:keyMessagesAnnouncement',
	RolesBirthday: 'commands/config:keyRolesBirthday',
	RolesNotified: 'commands/config:keyRolesNotified',
	Timezone: 'commands/config:keyTimezone'
};

@ApplyOptions<BirthdayySubcommand.Options>({
	description: 'commands:config:rootDescription',
	permissionLevel: PermissionLevels.Moderator,
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{ chatInputRun: 'runEdit', name: 'edit' },
		{ chatInputRun: 'runView', name: 'view' },
		{ chatInputRun: 'runReset', name: 'reset' }
	]
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

		const announcementChannel = interaction.options.getChannel('channels-announcement');
		if (!isNullish(announcementChannel)) {
			const result = await this.parseChannel(interaction, announcementChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['channelsAnnouncement', result.unwrap()]);
		}

		const announcementMessage = interaction.options.getString('messages-announcement');
		if (!isNullish(announcementMessage)) {
			const result = await this.parseAnnouncementMessage(interaction, announcementMessage);

			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['messagesAnnouncement', result.unwrap()]);
		}

		const birthdayRole = interaction.options.getRole('roles-birthday');
		if (!isNullish(birthdayRole)) {
			const result = await this.parseRole(interaction, birthdayRole, false);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['rolesBirthday', result.unwrap()]);
		}

		const birthdayPingRole = interaction.options.getRole('roles-notified');
		if (!isNullish(birthdayPingRole)) {
			const result = await this.parseRole(interaction, birthdayPingRole, true);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['rolesNotified', result.unwrap()]);
		}

		const overviewChannel = interaction.options.getChannel('channels-overview');
		if (!isNullish(overviewChannel)) {
			const result = await this.parseChannel(interaction, overviewChannel);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			await getBirthdays(interaction.guildId).updateBirthdayOverview();
			entries.push(['channelsOverview', result.unwrap()]);
		}

		const timezone = interaction.options.getInteger('timezone');
		if (!isNullish(timezone)) entries.push(['timezone', Number(timezone)]);

		return this.updateDatabase(interaction, Object.fromEntries(entries));
	}

	public runReset(interaction: BirthdayySubcommand.Interaction) {
		const key = interaction.options.getString('key', true) as ResetOptions;
		switch (key) {
			case 'all': {
				const data = {
					channelsAnnouncement: null,
					channelsOverview: null,
					messagesAnnouncement: null,
					messagesOverview: null,
					rolesBirthday: null,
					rolesNotified: null,
					timezone: 0
				} satisfies DefaultKey;
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

	public async runView(interaction: BirthdayySubcommand.Interaction) {
		const { id } = interaction.guild;
		const settings = await this.container.prisma.guild.findUnique({ where: { id } });

		const content = await this.viewGenerateContent(interaction, settings);

		const embed = new EmbedBuilder().setDescription(content).setColor(BrandingColors.Primary).setFooter(getFooterAuthor(interaction.user));

		return interaction.reply({ embeds: [embed], ephemeral: false });
	}

	private async parseAnnouncementMessage(interaction: Command.ChatInputCommandInteraction<'cached'>, announcementMessage: string) {
		const settingsManager = getSettings(interaction.guildId);
		const settings = await settingsManager.fetch();
		const defaultAnnouncementMessage = settingsManager.defaultKey.messagesAnnouncement;

		if (!settings?.premium && announcementMessage !== defaultAnnouncementMessage) {
			await this.container.prisma.guild.update({
				data: { messagesAnnouncement: defaultAnnouncementMessage },
				where: { id: interaction.guildId }
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

	private registerEditCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/config:edit')
			.addChannelOption((builder) =>
				applyLocalizedBuilder(
					builder,
					Key.ChannelsAnnouncement,
					'commands/config:editOptionsChannelsAnnouncementDescription'
				).addChannelTypes(ChannelType.GuildText)
			)
			.addStringOption((builder) =>
				applyLocalizedBuilder(builder, Key.MessagesAnnouncement, 'commands/config:editOptionsMessagesAnnouncementDescription')
					.setMinLength(1)
					.setMaxLength(512)
			)
			.addRoleOption((builder) => applyLocalizedBuilder(builder, Key.RolesBirthday, 'commands/config:editOptionsRolesBirthdayDescription'))
			.addRoleOption((builder) => applyLocalizedBuilder(builder, Key.RolesNotified, 'commands/config:editOptionsRolesNotifiedDescription'))
			.addChannelOption((builder) =>
				applyLocalizedBuilder(builder, Key.ChannelsOverview, 'commands/config:editOptionsChannelsOverviewDescription').addChannelTypes(
					ChannelType.GuildText
				)
			)
			.addIntegerOption((builder) =>
				applyLocalizedBuilder(builder, Key.Timezone, 'commands/config:editOptionsTimezoneDescription').setAutocomplete(true)
			);
	}

	private registerResetCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/config:reset').addStringOption((builder) =>
			applyLocalizedBuilder(builder, 'commands/config:resetOptionsKey')
				.addChoices(
					createLocalizedChoice('commands/config:resetOptionsChoicesAll', { value: 'all' }),
					createLocalizedChoice(Key.ChannelsAnnouncement, { value: 'channels-announcement' }),
					createLocalizedChoice(Key.MessagesAnnouncement, { value: 'messages-announcement' }),
					createLocalizedChoice(Key.RolesBirthday, { value: 'roles-birthday' }),
					createLocalizedChoice(Key.RolesNotified, { value: 'roles-notified' }),
					createLocalizedChoice(Key.ChannelsOverview, { value: 'channels-overview' }),
					createLocalizedChoice(Key.Timezone, { value: 'timezone' })
				)
				.setRequired(true)
		);
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/config:name', 'commands/config:description')
			.addSubcommand((subcommand) => this.registerEditCommand(subcommand))
			.addSubcommand((subcommand) => this.registerViewCommand(subcommand))
			.addSubcommand((subcommand) => this.registerResetCommand(subcommand));
	}

	private registerViewCommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/config:view');
	}

	private async updateDatabase(interaction: Command.ChatInputCommandInteraction<'cached'>, data: Partial<Guild>) {
		const result = await Result.fromAsync(await getSettings(interaction.guildId).update(data));

		const content = await result.match({
			err: (error) => {
				this.container.logger.error(error);
				return resolveKey(interaction, 'commands/config:editFailure');
			},
			ok: () => resolveKey(interaction, 'commands/config:editSuccess')
		});

		const embed = new EmbedBuilder() //
			.setDescription(content)
			.setColor(BrandingColors.Primary);

		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	private async viewGenerateContent(interaction: Command.ChatInputCommandInteraction<'cached'>, settings?: Partial<Guild> | null) {
		settings ??= {};

		const Unset = inlineCode(await resolveKey(interaction, 'globals:unset'));

		const announcementChannel = settings.channelsAnnouncement ? channelMention(settings.channelsAnnouncement) : Unset;
		const announcementMessage = settings.messagesAnnouncement ? formatBirthdayMessage(settings.messagesAnnouncement, interaction.member) : Unset;
		const birthdayRole = settings.rolesBirthday ? roleMention(settings.rolesBirthday) : Unset;
		const birthdayPingRole = settings.rolesNotified ? roleMention(settings.rolesNotified) : Unset;
		const overviewChannel = settings.channelsOverview ? channelMention(settings.channelsOverview) : Unset;
		const timezone = settings.timezone ? TIMEZONE_VALUES[settings.timezone] : Unset;

		return resolveKey(interaction, 'commands/config:viewContent', {
			announcementChannel,
			announcementMessage,
			birthdayPingRole,
			birthdayRole,
			overviewChannel,
			timezone
		});
	}
}

interface EditOptions {
	'channels-announcement': string;
	'channels-overview': string;
	'messages-announcement': string;
	'roles-birthday': string;
	'roles-notified': string;
	timezone: number;
}

type DefaultKey = Pick<
	Guild,
	| 'channelsAnnouncement' //
	| 'channelsOverview'
	| 'messagesAnnouncement'
	| 'messagesOverview'
	| 'rolesBirthday'
	| 'rolesNotified'
	| 'timezone'
>;

type ResetOptions = 'all' | keyof EditOptions;
