import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import { defaultUserPermissions } from '#lib/types';
import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';
import { type ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import { SlashCommandSubcommandBuilder, chatInputApplicationCommandMention } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	name: 'birthday',
})
export class BirthdayCommand extends Subcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			this.hooks.subcommands(this, builder);

			return applyLocalizedBuilder(builder, 'commands/birthday:birthday')
				.setDefaultMemberPermissions(defaultUserPermissions.bitfield)
				.setDMPermission(false);
		});
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', '935174192389840896'),
	Register: chatInputApplicationCommandMention('birthday', 'register', '935174192389840896'),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', '935174192389840896'),
	Show: chatInputApplicationCommandMention('birthday', 'show', '935174192389840896'),
	Test: chatInputApplicationCommandMention('birthday', 'test', '935174192389840896'),
	Update: chatInputApplicationCommandMention('birthday', 'update', '935174192389840896'),
} as const;

export function registerBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:register')
		.addIntegerOption((option) => dayOptions(option, 'commands/birthday:register.day'))
		.addStringOption((option) => monthOptions(option, 'commands/birthday:register.month'))
		.addIntegerOption((option) => yearOptions(option, 'commands/birthday:register.year'))
		.addUserOption((option) => userOptions(option, 'commands/birthday:register.user'));
}

export function listBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:list');
}

export function removeBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:remove').addUserOption((option) =>
		userOptions(option, 'commands/birthday:remove.user'),
	);
}

export function updateBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:update')
		.addIntegerOption((option) => dayOptions(option, 'commands/birthday:update.day'))
		.addStringOption((option) => monthOptions(option, 'commands/birthday:update.month'))
		.addIntegerOption((option) => yearOptions(option, 'commands/birthday:update.year'))
		.addUserOption((option) => userOptions(option, 'commands/birthday:update.user'));
}

export function showBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:show').addUserOption((option) =>
		userOptions(option, 'commands/birthday:show.user'),
	);
}

export function testBirthdaySubCommand(builder: SlashCommandSubcommandBuilder) {
	return applyLocalizedBuilder(builder, 'commands/birthday:test').addUserOption((option) =>
		userOptions(option, 'commands/birthday:test.user'),
	);
}
