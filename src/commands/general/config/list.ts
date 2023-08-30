import { generateDefaultEmbed, reply } from '#utils';
import generateConfigList from '#utils/birthday/config';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { listConfigSubCommand } from './config.js';

@RegisterSubCommand('config', (builder) => listConfigSubCommand(builder))
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		// TODO: Implement configList Command
		const configEmbed = await generateConfigList(interaction.guildId, { guild: interaction.guild });

		await reply(interaction, { embeds: [generateDefaultEmbed(configEmbed)] });
	}
}
