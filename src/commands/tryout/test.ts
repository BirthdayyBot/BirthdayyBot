import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { fetchMessage } from '../../lib/discord/message';

@ApplyOptions<Command.Options>({
	description: 'test things'
})
export class TestCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		// Register slash command
		registry.registerChatInputCommand(
			{
				name: this.name,
				description: this.description
			},
			{
				idHints: ['1069742031569690644'],
				guildIds: ['766707453994729532']
			}
		);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const res = await fetchMessage('931310807655022692', '123');
		console.log(res);
		await interaction.reply({ content: 'test', fetchReply: true });
	}
}
