import { interactionSuccess } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { pingRoleConfigSubCommand } from './config.js';
import { roleMention } from 'discord.js';

@RegisterSubCommand('config', (builder) => pingRoleConfigSubCommand(builder))
export class PingRoleCommand extends Command {
	@RequiresClientPermissions(['ManageRoles'])
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const role = interaction.options.getRole('role', true);

		await this.container.prisma.guild.upsert({
			create: { guildId: interaction.guildId, birthdayPingRole: role.id },
			where: { guildId: interaction.guildId },
			update: { birthdayPingRole: role.id },
		});

		return interactionSuccess(interaction, 'commands/config:pingRole:success', {
			role: roleMention(role.id),
		});
	}
}
