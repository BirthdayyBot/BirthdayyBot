import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { Result } from '@sapphire/result';
import { roleMention } from 'discord.js';
import { reply } from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

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
		const result = await Result.fromAsync(() =>
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { birthdayPingRole: role.id },
			}),
		);

		if (result.isErr()) {
			return reply(interaction, interactionProblem('An error occurred while trying to update the config.'));
		}

		return reply(
			interaction,
			interactionSuccess(`Successfully set the birthday ping role to ${roleMention(role.id)}`),
		);
	}
}
