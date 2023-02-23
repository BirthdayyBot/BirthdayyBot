import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import replyToInteraction from '../../helpers/send/response';
import generateEmbed from '../../helpers/generate/embed';
import checkCurrentBirthdays from '../../lib/birthday/checkCurrentBirthdays';

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
		await checkCurrentBirthdays();

		const embed = await generateEmbed({ title: 'test' });
		await replyToInteraction(interaction, { content: `\`\`\`TEST RUN\`\`\``, embeds: [embed] });
		return;
	}
}
