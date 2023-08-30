import { userOptions } from '#lib/components/builder';
import { defaultUserPermissions } from '#lib/types';
import { getCommandGuilds } from '#utils/functions';
import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import { chatInputApplicationCommandMention, type SlashCommandSubcommandBuilder } from 'discord.js';

export class BlacklistCommand extends Subcommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		const guildIds = await getCommandGuilds('premium');
		registry.registerChatInputCommand(
			(builder) => {
				this.hooks.subcommands(this, builder);
				return applyLocalizedBuilder(builder, 'commands/blacklist:blacklist')
					.setDefaultMemberPermissions(defaultUserPermissions.add('ManageRoles').bitfield)
					.setDMPermission(false);
			},
			{ guildIds },
		);
	}
}

export const BlacklistApplicationCommandMentions = {
	Add: chatInputApplicationCommandMention('blacklist', 'add', ''),
	List: chatInputApplicationCommandMention('blacklist', 'list', ''),
	Remove: chatInputApplicationCommandMention('blacklist', 'remove', ''),
} as const;

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
