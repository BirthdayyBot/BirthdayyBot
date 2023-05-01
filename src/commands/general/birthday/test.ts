import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { interactionSuccess } from '../../../lib/utils/embed';
import { RequiresUserPermissions } from '@sapphire/decorators';
import { reply } from '../../../helpers';

@RegisterSubCommand('birthday', (builder) =>
	builder
		.setName('test')
		.setDescription('Test your current birthday configurations')
		.addUserOption((option) => option.setName('user').setDescription('The user to test the birthday for')),
)
export class TestCommand extends Command {
	@RequiresUserPermissions(['ManageGuild'])
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const target = interaction.options.getUser('user') ?? interaction.member.user;
		await this.container.tasks.run('BirthdayReminderTask', {
			userId: target.id,
			guildId: interaction.guildId,
			isTest: true,
		});

		return reply(interaction, interactionSuccess('Birthday Test Run!'));
	}
}
