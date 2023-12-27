import { CustomCommand, CustomSubCommand } from '#lib/structures/commands/CustomCommand';
import { SettingsDefaultKey } from '#lib/structures/managers/SettingsManager';
import { PermissionLevels } from '#lib/types/Enums';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { getBirthdays, getSettings } from '#utils/functions/guilds';
import { createSubcommandMappings, reply } from '#utils/utils';
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds } from '@sapphire/discord.js-utilities';
import { CommandOptionsRunTypeEnum, type ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import {
	ChannelType,
	PermissionFlagsBits,
	bold,
	channelMention,
	chatInputApplicationCommandMention,
	roleMention,
} from 'discord.js';

@ApplyOptions<CustomSubCommand.Options>({
	subcommands: createSubcommandMappings(
		'announcement-channel',
		'announcement-message',
		'birthday-role',
		'list',
		'overview-channel',
		'ping-role',
		'reset',
		'timezone',
	),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Administrator,
})
export class ConfigCommand extends CustomSubCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => registerConfigCommand(builder), {
			guildIds: ['980559116076470272'],
		});
	}

	public async announcementChannel(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const announcementChannel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]);
		const options = { channel: channelMention(announcementChannel.id) };

		if (!canSendEmbeds(announcementChannel)) {
			return interactionProblem(
				interaction,
				await resolveKey(interaction, 'commands/config:announcementChannel.cannotPermissions', options),
			);
		}

		await getSettings(interaction.guild).update({ announcementChannel: announcementChannel.id });
		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/config:announcementChannel.success', options),
		);
	}

	public async announcementMessage(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const announcementMessage = interaction.options.getString('message', true);

		const { premium } = await getSettings(interaction.guild).fetch();

		if (!premium) {
			return interactionProblem(
				interaction,
				await resolveKey(interaction, 'commands/config:announcementMessage.requirePremium'),
			);
		}

		await getSettings(interaction.guild).update({ announcementMessage });

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/config:announcementMessage.success', {
				message: announcementMessage,
			}),
		);
	}

	public async birthdayRole(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const role = interaction.options.getRole('role', true);
		const bot = await interaction.guild.members.fetchMe();
		const highestBotRole = bot.roles.highest;

		if (highestBotRole.position <= role.position) {
			return interactionProblem(
				interaction,
				await resolveKey(interaction, 'commands/config.birthdayRole.highestBotRole'),
			);
		}

		await getSettings(interaction.guild).update({ birthdayRole: role.id });

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/config:birthdayRole.success', { role: roleMention(role.id) }),
		);
	}

	public async list(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const configEmbed = await getSettings(interaction.guild).embedList();

		return reply(interaction, { embeds: [configEmbed] });
	}

	public async overviewChannel(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const channel = interaction.options.getChannel<ChannelType.GuildText>('channel', true);

		if (!canSendEmbeds(channel)) {
			return interactionProblem(
				interaction,
				await resolveKey(interaction, 'commands/config:overviewChannel.cannotPermissions', {
					channel: channelMention(channel.id),
				}),
			);
		}

		const message = await channel.send({ content: 'Loading...' });

		const birthdays = getBirthdays(interaction.guild).findTeenNextBirthday();

		await getBirthdays(interaction.guild).sendListBirthdays(
			message,
			birthdays,
			'commands/birthday:list.title.next',
		);

		await getSettings(interaction.guild).update({ overviewMessage: message.id, overviewChannel: channel.id });

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/config:overviewChannel.success', {
				channel: channelMention(channel.id),
			}),
		);
	}

	public async pingRole(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const role = interaction.options.getRole('role', true);

		await getSettings(interaction.guild).update({ birthdayPingRole: role.id });
		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/config:pingRole.success', { role: roleMention(role.id) }),
		);
	}

	public async reset(interaction: CustomSubCommand.ChatInputCommandInteraction<'cached'>) {
		const settings = interaction.options.getString('config', true) as SettingsDefaultKey;
		const config = bold(await resolveKey(interaction, `commands/config:reset.choices.${settings}`));

		await getSettings(interaction.guild).resetKey(settings);

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/config:reset.success', { config }),
		);
	}

	public async timezone(interaction: CustomCommand.ChatInputCommandInteraction<'cached'>) {
		const timezone = interaction.options.getInteger('timezone', true);

		await getSettings(interaction.guild).update({ timezone });

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/config:timezone.success', {
				timezone,
			}),
		);
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
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
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
