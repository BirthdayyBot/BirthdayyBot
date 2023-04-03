import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions } from '@sapphire/decorators';
import { Result } from '@sapphire/result';
import { roleMention } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

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
			const embed = generateEmbed({
				title: 'Error',
				description: 'An error occurred while trying to set the birthday role.',
			});
			return replyToInteraction(interaction, { embeds: [embed] });
		}

		const embed = generateEmbed({
			title: 'Success',
			description: `The birthday role has been set to ${roleMention(role.id)}.`,
		});

		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
