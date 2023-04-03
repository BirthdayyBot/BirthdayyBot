import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	name: 'config',
	description: 'Config Command',
})
export class BirthdayCommand extends Subcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			// It is necessary to call this hook and pass the builder context to register the subcommands stored in the subcommand register in the parent command.
			this.hooks.subcommands(this, builder);

			// Calling both hooks is only necessary if required, it is not mandatory.
			return applyLocalizedBuilder(builder, this.name, this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
				.setDMPermission(false);
		});
	}
}
