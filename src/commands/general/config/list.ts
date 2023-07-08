import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import generateConfigList from '../../../helpers/generate/configList';
import { reply } from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';
import { generateDefaultEmbed } from '../../../lib/utils/embed';

@RegisterSubCommand('config', (builder) =>
	builder.setName('list').setDescription('List all Birthdays in this Discord server'),
)
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		// TODO: Implement configList Command
		await thinking(interaction);

		const configEmbed = await generateConfigList(interaction.guildId, { guild: interaction.guild });

		await reply(interaction, { embeds: [generateDefaultEmbed(configEmbed)] });
	}
}
