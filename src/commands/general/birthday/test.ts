import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { inlineCode } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, FAIL, SUCCESS } from '../../../helpers/provide/environment';
import { hasUserGuildPermissions } from '../../../helpers/provide/permission';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('birthday', (builder) =>
	builder.setName('test').setDescription('Test your current birthday configurations'),
)
export class TestCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.user;

		if (!(await hasUserGuildPermissions({ interaction, user: targetUser, permissions: ['ManageRoles'] }))) {
			const embed = generateEmbed({
				title: `${FAIL} Failed`,
				description: `${ARROW_RIGHT} ${inlineCode("You don't have the permission to run this command.")}`,
			});
			return replyToInteraction(interaction, { embeds: [embed] });
		}

		await this.container.tasks.run('BirthdayReminderTask', {
			userId: targetUser.id,
			guildId: interaction.guildId,
			isTest: true,
		});

		const embed = generateEmbed({
			title: `${SUCCESS} Success`,
			description: `${ARROW_RIGHT} ${inlineCode('Birthday Test Run!')}`,
		});

		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
