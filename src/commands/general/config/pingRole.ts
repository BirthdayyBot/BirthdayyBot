import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { Result } from '@sapphire/result';
import { roleMention } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, SUCCESS } from '../../../helpers/provide/environment';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

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

		const result = await Result.fromAsync(() =>
			this.container.prisma.guild.update({
				where: { guildId: interaction.guildId },
				data: { birthdayPingRole: role.id },
			}),
		);

		if (result.isErr()) {
			const embed = generateEmbed({
				title: 'Error',
				description: 'An error occurred while trying to set the birthday role.',
			});
			return replyToInteraction(interaction, { embeds: [embed] });
		}

		const embed = generateEmbed({
			title: `${SUCCESS} Success`,
			description: `${ARROW_RIGHT} You set the **Birthday Ping Role** to ${roleMention(role.id)}`,
		});

		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
