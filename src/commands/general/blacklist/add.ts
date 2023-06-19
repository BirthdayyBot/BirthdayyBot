import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { Prisma } from '@prisma/client';
import { userMention } from 'discord.js';
import { reply } from '../../../helpers/send/response';
import { PrismaErrorCodeEnum } from '../../../lib/enum/PrismaErrorCode.enum';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

@RegisterSubCommand('blacklist', (builder) =>
	builder
		.setName('add')
		.setDescription('Add a user to the blacklist')
		.addUserOption((option) =>
			option.setName('user').setDescription('User to add to the blacklist').setRequired(true),
		),
)
export class AddCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const blacklistUser = interaction.options.getUser('user', true);
		if (blacklistUser.id === interaction.user.id) {
			return reply(interaction, interactionProblem(`You can't blacklist yourself.`, true));
		}
		try {
			await this.container.utilities.blacklist.create.BlacklistEntry(interaction.guildId, blacklistUser.id);
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === PrismaErrorCodeEnum.UNIQUE_CONSTRAINT_FAILED) {
					return reply(
						interaction,
						interactionProblem(`${userMention(blacklistUser.id)} is already on the blacklist.`, true),
					);
				}
			}
		}
		return reply(interaction, interactionSuccess(`Added ${userMention(blacklistUser.id)} to the blacklist.`, true));
	}
}
