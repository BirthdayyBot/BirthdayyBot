import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice } from '@sapphire/plugin-i18next';
import {
	ChannelType,
	PermissionFlagsBits,
	SlashCommandSubcommandBuilder,
	chatInputApplicationCommandMention,
} from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	name: 'config',
	description: 'Config Command',
})
export class ConfigCommand extends Subcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			// It is necessary to call this hook and pass the builder context to register the subcommands stored in the subcommand register in the parent command.
			this.hooks.subcommands(this, builder);

			// Calling both hooks is only necessary if required, it is not mandatory.
			return builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
				.setDMPermission(false);
		});
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

export function announcementChannelConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:announcement-channel').addChannelOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:announcement-channel.channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);
}

export function annoncementMessageConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:announcement-message').addStringOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:announcement-message.message')
			.setMinLength(1)
			.setMaxLength(512)
			.setRequired(true),
	);
}

export function birthdayRoleConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:birthday-role').addRoleOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:birthday-role.role').setRequired(true),
	);
}

export function listConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:list');
}

export function overviewChannelConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:overview-channel').addChannelOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:overview-channel.channel')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true),
	);
}

export function pingRoleConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:ping-role').addRoleOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:ping-role').setRequired(true),
	);
}

export function resetConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/config:reset').addStringOption((builder) =>
		applyLocalizedBuilder(builder, 'commands/config:reset.config').addChoices(
			createLocalizedChoice('commands/config:reset.choices.birthdayRole', { value: 'birthdayRole' }),
			createLocalizedChoice('commands/config:reset.choices.birthdayPingRole', { value: 'birthdayPingRole' }),
			createLocalizedChoice('commands/config:reset.choices.announcementChannel', {
				value: 'announcementChannel',
			}),
			createLocalizedChoice('commands/config:reset.choices.overviewChannel', { value: 'overviewChannel' }),
			createLocalizedChoice('commands/config:reset.choices.overviewMessage', { value: 'overviewMessage' }),
			createLocalizedChoice('commands/config:reset.choices.timezone', { value: 'timezone' }),
			createLocalizedChoice('commands/config:reset.choices.logChannel', { value: 'logChannel' }),
		),
	);
}

export function timezoneConfigSubCommand(builder: SlashCommandSubcommandBuilder) {
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
