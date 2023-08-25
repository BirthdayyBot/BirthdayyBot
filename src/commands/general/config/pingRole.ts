import thinking from '#lib/discord/thinking';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, reply } from '#utils';
import { resolveOnErrorCodesPrisma } from '#utils/functions';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { roleMention } from 'discord.js';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('ping-role')
		.setDescription('Ping a role on someones birthday')
		.addRoleOption((option) =>
			option.setName('role').setDescription('Role that should get pinged on someones birthday').setRequired(true),
		),
)
export class PingRoleCommand extends Command {
	@RequiresClientPermissions(['ManageRoles'])
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const role = interaction.options.getRole('role', true);
		// check if role is everyone or here
		if (role.id === interaction.guildId) {
			return reply(interaction, interactionProblem('You can not set the ping role to @everyone or @here'));
			// TODO: #32 Enable everyone and here to be pinged
		}

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { birthdayPingRole: role.id },
			}),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullOrUndefinedOrEmpty(result)) {
			return reply(interaction, interactionProblem('An error occurred while trying to update the config.'));
		}

		return reply(
			interaction,
			interactionSuccess(`Successfully set the birthday ping role to ${roleMention(role.id)}`),
		);
	}
}
