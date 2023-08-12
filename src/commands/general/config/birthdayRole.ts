import thinking from '#lib/discord/thinking';
import { PrismaErrorCodeEnum } from '#lib/types';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { reply } from '#utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { roleMention } from 'discord.js';

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

		const guild = await resolveOnErrorCodesPrisma(
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { birthdayRole: role.id },
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullOrUndefinedOrEmpty(guild)) {
			return reply(interactionProblem('An error occurred while trying to update the config.'));
		}

		return reply(interactionSuccess(`Successfully set the birthday role to ${roleMention(role.id)}.`));
	}
}
