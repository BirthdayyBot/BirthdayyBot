import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { reply } from '../../../helpers';
import { interactionSuccess } from '../../../lib/utils/embed';
import { testBirthdaySubCommand } from '../../../lib/commands';
import { RequiresUserPermissions } from '@sapphire/decorators';

@RegisterSubCommand('birthday', (builder) => testBirthdaySubCommand(builder))
export class TestCommand extends Command {
	@RequiresUserPermissions('ManageGuild')
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
