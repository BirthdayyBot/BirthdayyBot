import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { reply } from '../../../helpers';
import { interactionProblem, interactionSuccess } from '../../../lib/utils/embed';

@RegisterSubCommand('birthday', (builder) =>
	builder
		.setName('test')
		.setDescription('Test your current birthday configurations')
		.addUserOption((option) => option.setName('user').setDescription('The user to test the birthday for')),
)
export class TestCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const target = interaction.options.getUser('user') ?? interaction.member.user;

		const { memberPermissions } = interaction;

		if (!memberPermissions.has('ManageGuild')) {
			return reply(interaction, interactionProblem("You don't have the permission to test the current configs."));
		}

		await this.container.tasks.run('BirthdayReminderTask', {
			userId: target.id,
			guildId: interaction.guildId,
			isTest: true,
		});

		return reply(interaction, interactionSuccess('Birthday Test Run!'));
	}
}
