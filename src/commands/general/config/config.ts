import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';

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
