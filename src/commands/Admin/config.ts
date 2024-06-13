import { DefaultEmbedBuilder } from '#lib/discord';
import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#root/config';
import { TIMEZONE_VALUES, formatBirthdayMessage } from '#utils/common';
import { ClientColor } from '#utils/constants';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import type { Guild } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import {
	Command,
	CommandOptionsRunTypeEnum,
	Result,
	err,
	ok,
	type ApplicationCommandRegistry
} from '@sapphire/framework';
import {
	applyDescriptionLocalizedBuilder,
	applyLocalizedBuilder,
	createLocalizedChoice,
	fetchT,
	type TFunction
} from '@sapphire/plugin-i18next';
import { isNullOrUndefined, isNullish } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import {
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	Role,
	SlashCommandBuilder,
	blockQuote,
	channelMention,
	chatInputApplicationCommandMention,
	inlineCode,
	roleMention,
	type Channel,
	type EmbedField,
	type InteractionReplyOptions
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
				applyDescriptionLocalizedBuilder(builder, 'commands/config:rootDescription')
					.setName('config')
					.setDMPermission(false)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
			)
		);
	}

	public async chatInputRunEdit(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const entries: [keyof Guild, Guild[keyof Guild]][] = [];

		const t = await fetchT(interaction);

		const announcementChannel = interaction.options.getChannel('announcement-channel');
		if (!isNullish(announcementChannel)) {
			const result = await this.parseChannel(announcementChannel, t);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['announcementChannel', result.unwrap()]);
		}

		const announcementMessage = interaction.options.getString('announcement-message');
		if (!isNullish(announcementMessage)) {
			const result = await this.parseAnnouncementMessage(interaction, announcementMessage, t);

			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['announcementMessage', result.unwrap()]);
		}

		const birthdayRole = interaction.options.getRole('birthday-role');
		if (!isNullish(birthdayRole)) {
			const result = await this.parseRole(interaction, birthdayRole, t);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayRole', result.unwrap()]);
		}

		const birthdayPingRole = interaction.options.getRole('birthday-ping-role');
		if (!isNullish(birthdayPingRole)) {
			const result = await this.parseRoleMention(birthdayPingRole, t);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['birthdayPingRole', result.unwrap()]);
		}

		const overviewChannel = interaction.options.getChannel('overview-channel');
		if (!isNullish(overviewChannel)) {
			const result = await this.parseChannel(overviewChannel, t);
			if (result.isErr()) return interaction.reply({ content: result.unwrapErr(), ephemeral: true });

			entries.push(['overviewChannel', result.unwrap()]);
		}

		const timezone = interaction.options.getInteger('timezone');
		if (!isNullish(timezone)) entries.push(['timezone', Number(timezone)]);

		return this.updateDatabase(interaction, Object.fromEntries(entries));
	}

	public async chatInputRunView(interaction: BirthdayySubcommand.Interaction<'cached'>) {
		const id = interaction.guildId;
		const settings = await this.container.prisma.guild.findUnique({ where: { id } });

		const content = await this.viewGenerateContent(interaction, settings);
		return interaction.reply(content);
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
		settings?: Partial<Guild> | null
	): Promise<InteractionReplyOptions> {
		settings ??= {};

		const t = await fetchT(interaction);

		const unset = inlineCode(t('globals:unset'));
		const bool = [inlineCode(t('globals:disabled')), inlineCode(t('globals:enabled'))];

		const settingsEmbed = new EmbedBuilder()
			.setTitle(t('commands/config:viewEmbedTitle'))
			.setDescription(t('commands/config:viewEmbedDescription'))
			.setColor(ClientColor)
			.setThumbnail(interaction.guild.iconURL());

		const announcementMessage = formatBirthdayMessage(
			settings.announcementMessage ?? DEFAULT_ANNOUNCEMENT_MESSAGE,
			interaction.member
		);

		const infoBirthdayMessage = settings.premium
			? t('commands/config:viewBirthdayMessagePremiumEnabled')
			: t('commands/config:viewBirthdayMessagePremiumDisable');

		const announcementChannel = settings.announcementChannel ? channelMention(settings.announcementChannel) : unset;
		const birthdayRole = settings.birthdayRole ? roleMention(settings.birthdayRole) : unset;
		const birthdayPingRole = settings.birthdayPingRole ? roleMention(settings.birthdayPingRole) : unset;
		const overviewChannel = settings.overviewChannel ? channelMention(settings.overviewChannel) : unset;
		const timezone = isNullOrUndefined(settings.timezone) ? unset : TIMEZONE_VALUES[settings.timezone];
		const premium = bool[Number(settings.premium)];

		const fieldsTitles: string[] = t('commands/config:viewFieldsTitles', { returnObjects: true });
		const fieldsValues: string[] = t('commands/config:viewFieldsValues', {
			returnObjects: true,
			announcementChannel,
			birthdayRole,
			birthdayPingRole,
			premium,
			overviewChannel,
			timezone
		});

		settingsEmbed.addFields([...this.generateEmbedFields(fieldsTitles, fieldsValues)]);

		const birthdayEmbed = new DefaultEmbedBuilder()
			.setTitle(t('commands/config:viewBirthdayEmbedTitle'))
			.setDescription(`${announcementMessage} \n\n ${blockQuote(infoBirthdayMessage)}`)
			.setColor(ClientColor);

		return { embeds: [settingsEmbed.toJSON(), birthdayEmbed.toJSON()], ephemeral: false };
	}

	private *generateEmbedFields(title: string[], values: string[]): IterableIterator<EmbedField> {
		for (let i = 0; i < title.length; i++) {
			yield { name: title[i], value: values[i], inline: false };
		}
	}

	private async updateDatabase(interaction: Command.ChatInputCommandInteraction<'cached'>, data: Partial<Guild>) {
		const id = interaction.guildId;
		const result = await Result.fromAsync(
			this.container.prisma.guild.upsert({
				where: { id },
				create: { id, ...data },
				update: data,
				select: null
			})
		);

		const t = await fetchT(interaction);

		const content = await result.match({
			ok: async () => interactionSuccess(t('commands/config:editSuccess')),
			err: async (error) => {
				this.container.logger.error(error);
				return interactionProblem(t('commands/config:editFailure'));
			}
		});

		return interaction.reply(content);
	}

	private async parseChannel(channel: Channel, t: TFunction) {
		if (!canSendEmbeds(channel))
			return err(t('commands/config:editChannelCanSendEmbeds', { channel: channelMention(channel.id) }));

		return ok(channel.id);
	}

	private async parseAnnouncementMessage(
		interaction: Command.ChatInputCommandInteraction<'cached'>,
		announcementMessage: string,
		t: TFunction
	) {
		const settings = await this.container.prisma.guild.findUnique({
			where: { id: interaction.guildId },
			select: { premium: true }
		});

		if (!settings?.premium) return err(t('commands/config:editAnnouncementMessagePremium'));

		return ok(announcementMessage);
	}

	private async parseRole(interaction: Command.ChatInputCommandInteraction<'cached'>, role: Role, t: TFunction) {
		const me = await interaction.guild.members.fetchMe();

		if (role.position >= me.roles.highest.position) {
			return err(t('commands/config:editRoleHigher', { role: roleMention(role.id) }));
		}

		return ok(role.id);
	}

	private async parseRoleMention(role: Role, t: TFunction) {
		if (!role.mentionable) return err(t('commands/config:editRoleMentionable', { role: roleMention(role.id) }));

		return ok(role.id);
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
