import { Subcommand } from '@kaname-png/plugin-subcommands-advanced';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import { getCommandGuilds } from '../../../helpers';

@ApplyOptions<Subcommand.Options>({
	name: 'blacklist',
	description: 'Blacklist Command',
})
export class BlacklistCommand extends Subcommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) => {
				this.hooks.subcommands(this, builder);
				return builder
					.setName(this.name)
					.setDescription(this.description)
					.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
					.setDMPermission(false);
			},
			{
				guildIds: await getCommandGuilds('premium'),
			},
		);
	}
}
