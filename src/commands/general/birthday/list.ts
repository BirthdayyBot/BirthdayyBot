import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import generateBirthdayList from '../../../helpers/generate/birthdayList';
import generateEmbed from '../../../helpers/generate/embed';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('birthday', (builder) =>
	builder.setName('list').setDescription('List all Birthdays in this Discord server'),
)
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guildId);

		const generatedEmbed = generateEmbed(embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], components });
	}
}
