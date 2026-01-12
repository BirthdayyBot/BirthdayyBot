import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { generateBirthdayList } from '../../../helpers/';

@RegisterSubCommand('birthday', (builder) =>
	builder.setName('list').setDescription('List all Birthdays in this Discord server'),
)
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		// Defer reply to show user we're processing
		await interaction.deferReply();

		const paginatedMessage = await generateBirthdayList(interaction.guild);

		return paginatedMessage.run(interaction);
	}
}
