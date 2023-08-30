import { interactionProblem, interactionSuccess } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { birthdayRoleConfigSubCommand } from './config.js';
import { roleMention } from 'discord.js';

@RegisterSubCommand('config', (builder) => birthdayRoleConfigSubCommand(builder))
export class ListCommand extends Command {
	@RequiresClientPermissions(['ManageRoles'])
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const role = interaction.options.getRole('role', true);
		const bot = await interaction.guild.members.fetchMe();
		const highestBotRole = bot.roles.highest;

		if (highestBotRole.position <= role.position) {
			return interactionProblem(interaction, 'commands/config.birthdayRole.highestBotRole');
		}

		await this.container.prisma.guild.upsert({
			create: { guildId: interaction.guildId, birthdayRole: role.id },
			where: { guildId: interaction.guildId },
			update: { birthdayRole: role.id },
		});

		return interactionSuccess(interaction, 'commands/config.birthdayRole.succes', {
			role: roleMention(role.id),
		});
	}
}
