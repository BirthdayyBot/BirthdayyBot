import thinking from '#lib/discord/thinking';
import { generateDefaultEmbed } from '#lib/utils/embed';
import { generateBirthdayList } from '#root/helpers/generate/birthdayList';
import { reply } from '#root/helpers/send/response';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';

@RegisterSubCommand('birthday', (builder) => builder.setName('list').setDescription('List all Birthdays in this Discord server'))
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guild);

		await reply(interaction, { embeds: [generateDefaultEmbed(embed)], components });
	}
}
