import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { userMention } from 'discord.js';
import { reply } from '../../../helpers';
import updateBirthdayOverview from '../../../helpers/update/overview';
import { interactionProblem, interactionValidate } from '../../../lib/utils/embed';
import { catchToNull } from '../../../lib/utils/promises';

@RegisterSubCommand('birthday', (builder) =>
	builder
		.setName('remove')
		.setDescription('Remove a birthday - MANAGER ONLY')
		.addUserOption((options) =>
			options.setName('user').setDescription('The user you want to remove the birthday from').setRequired(true),
		),
)
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const targetUser = interaction.options.getMember('user') ?? interaction.member;
		const { guildId } = interaction;

		const TargetIsNotUser = targetUser.id !== interaction.user.id;

		if (TargetIsNotUser && interaction.member.permissions.has('ManageRoles')) {
			return reply(
				interaction,
				interactionProblem("You don't have the permission to remove other users birthdays."),
			);
		}

		const birthday = await catchToNull(
			container.prisma.birthday.delete({
				where: {
					userId_guildId: {
						userId: targetUser.id,
						guildId,
					},
				},
			}),
		);

		if (!birthday) {
			return reply(
				interaction,
				interactionProblem(
					`${TargetIsNotUser ? `${userMention(targetUser.id)}'s` : 'Your'} birthday is not registered.`,
				),
			);
		}

		await updateBirthdayOverview(guildId);
		return reply(
			interaction,
			interactionValidate(
				`${TargetIsNotUser ? `${userMention(targetUser.id)}'s` : 'Your'} birthday has been removed.`,
			),
		);
	}
}
