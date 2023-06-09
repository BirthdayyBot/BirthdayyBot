import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	name: 'birthday',
	description: 'Birthday Command',
})
export class BirthdayCommand extends Subcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			// It is necessary to call this hook and pass the builder context to register the subcommands stored in the subcommand register in the parent command.

			// Calling both hooks is only necessary if required, it is not mandatory.
			applyLocalizedBuilder(builder, 'commands/birthday:name', 'commands/birthday:description')
				.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel)
				.setDMPermission(false);

			this.hooks.subcommands(this, builder);
		});
	}
}
