import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { interactionValidate } from '../../../lib/utils/embed';
import { RequiresUserPermissions } from '@sapphire/decorators';
import { reply } from '../../../helpers';

@RegisterSubCommand('birthday', (builder) =>
	builder.setName('test').setDescription('Test your current birthday configurations'),
)
export class TestCommand extends Command {
	@RequiresUserPermissions(['ManageRoles'])
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await this.container.tasks.run('BirthdayReminderTask', {
			userId: interaction.member.id,
			guildId: interaction.guildId,
			isTest: true,
		});

		return reply(interaction, interactionValidate('Birthday Test Run!'));
	}
}
