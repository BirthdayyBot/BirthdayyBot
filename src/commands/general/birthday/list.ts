import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { generateBirthdayList, reply } from '../../../helpers/';
import thinking from '../../../lib/discord/thinking';
import { generateEmbedWithDefault } from '../../../lib/utils/embed';

@RegisterSubCommand('birthday', (builder) =>
	builder.setName('list').setDescription('List all Birthdays in this Discord server'),
)
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guildId);

		await reply(interaction, { embeds: [generateEmbedWithDefault(embed)], components });
	}
}
