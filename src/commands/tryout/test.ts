import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { fetchMessage } from '../../lib/discord/message';
import { getCommandGuilds } from '../../helpers/utils/guilds';

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
				guildIds: getCommandGuilds('testing')
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
