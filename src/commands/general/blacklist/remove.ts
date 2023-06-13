import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Prisma } from '@prisma/client';
import { userMention } from 'discord.js';
import { reply } from '../../../helpers/send/response';
import { PrismaErrorCodeEnum } from '../../../lib/enum/PrismaErrorCode.enum';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

@RegisterSubCommand('blacklist', (builder) =>
	builder
		.setName('remove')
		.setDescription('Remove a blacklisted user from the blacklist')
		.addUserOption((option) =>
			option.setName('user').setDescription('User to remove from the blacklist').setRequired(true),
		),
)
export class RemoveCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const blacklistUser = interaction.options.getUser('user', true);
		try {
			await this.container.utilities.blacklist.delete.BlacklistEntry(interaction.guildId, blacklistUser.id);
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === PrismaErrorCodeEnum.NOT_FOUND) {
					return reply(
						interaction,
						interactionProblem(`${userMention(blacklistUser.id)} is not blacklisted.`, true),
					);
				}
			}
		}
		return reply(
			interaction,
			interactionSuccess(`Removed ${userMention(blacklistUser.id)} from the blacklist.`, true),
		);
	}
}
