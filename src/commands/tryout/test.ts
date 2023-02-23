import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import replyToInteraction from '../../helpers/send/response';
import { BOT_COLOR, BOT_AVATAR } from '../../helpers/provide/environment';
import generateEmbed from '../../helpers/generate/embed';

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
		console.log('process.env.BOT_COLOR', process.env.BOT_COLOR);
		console.log('process.env.BOT_AVATAR', process.env.BOT_AVATAR);
		console.log('BOT_COLOR', BOT_COLOR);
		console.log('BOT_AVATAR', BOT_AVATAR);
		const embed = await generateEmbed({ title: 'test' });
		await replyToInteraction(interaction, { content: `\`\`\`TEST RUN\`\`\``, embeds: [embed] });
		return;
		// const content = JSON.stringify(process.env, null, 2);

		// if (content.length <= 2000) {
		// 	await replyToInteraction(interaction, { content: `\`\`\`${content}\`\`\`` });
		// 	return;
		// }

		// const chunks = content.match(/[\s\S]{1,1900}/g) || [];

		// for (const chunk of chunks) {
		// 	await replyToInteraction(interaction, { content: `\`\`\`${chunk}\`\`\`` });
		// }
	}
}
