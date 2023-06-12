import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { Result } from '@sapphire/result';
import { roleMention } from 'discord.js';
import { reply } from '../../../helpers';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('birthday-role')
		.setDescription('List all Birthdays in this Discord server')
		.addRoleOption((option) =>
			option.setName('role').setDescription('Role that should get assigned on a birthday').setRequired(true),
		),
)
export class ListCommand extends Command {
	@RequiresClientPermissions(['ManageRoles'])
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const role = interaction.options.getRole('role', true);

		const guildResult = await Result.fromAsync(() =>
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { birthdayRole: role.id },
			}),
		);

		if (guildResult.isErr()) {
			return reply(interaction, interactionProblem('An error occurred while trying to update the config.'));
		}

		return reply(interaction, interactionSuccess(`Successfully set the birthday role to ${roleMention(role.id)}.`));
	}
}
