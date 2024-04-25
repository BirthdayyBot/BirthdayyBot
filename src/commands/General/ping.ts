import { Emojis } from '#lib/utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	description: 'ping pong'
})
export class PingCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const msg = await interaction.reply({ content: `${Emojis.Ping} Loading...` });

		const content = `${Emojis.Ping}Bot Latency ${Math.round(this.container.client.ws.ping)}ms.\n ${Emojis.Ping}API Latency ${
			msg.createdTimestamp - interaction.createdTimestamp
		}ms.`;

		return interaction.editReply({ content });
	}

	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand({
			description: this.description,
			name: this.name
		});
	}
}
