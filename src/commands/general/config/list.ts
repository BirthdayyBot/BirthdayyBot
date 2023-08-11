import thinking from '#lib/discord/thinking';
import generateConfigList from '#lib/utils/birthday/config';
import { generateDefaultEmbed } from '#lib/utils/embed';
import { reply } from '#lib/utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';

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
