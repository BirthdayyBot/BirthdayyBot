import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { inlineCode, userMention } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, BOOK, FAIL } from '../../../helpers/provide/environment';
import { hasUserGuildPermissions } from '../../../helpers/provide/permission';
import replyToInteraction from '../../../helpers/send/response';
import updateBirthdayOverview from '../../../helpers/update/overview';
import thinking from '../../../lib/discord/thinking';

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
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const { guildId } = interaction;

		if (
			interaction.user.id !== targetUser.id &&
			!(await hasUserGuildPermissions({ interaction, user: interaction.user, permissions: ['ManageRoles'] }))
		) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode(
							"You don't have the permission to remove other users birthdays.",
						)}`,
					}),
				],
				ephemeral: true,
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guildId, targetUser.id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('This user has no birthday registered.')}`,
					}),
				],
				ephemeral: true,
			});
		}

		try {
			await container.utilities.birthday.delete.ByGuildAndUser(guildId, targetUser.id);
			await updateBirthdayOverview(guildId);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${BOOK} Birthday Removed`,
						description: `${ARROW_RIGHT} The birthday of ${userMention(
							targetUser.id,
						)} was successfully removed.`,
					}),
				],
				ephemeral: true,
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occured while removing the birthday.')}`,
					}),
				],
				ephemeral: true,
			});
		}
	}
}
