import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { generateBirthdayList, reply } from '../../../helpers/';
import thinking from '../../../lib/discord/thinking';
import { generateDefaultEmbed } from '../../../lib/utils/embed';
import { listBirthdaySubCommand } from '../../../lib/commands';

@RegisterSubCommand('birthday', (builder) => listBirthdaySubCommand(builder))
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guild);

		await reply(interaction, { embeds: [generateDefaultEmbed(embed)], components });
	}
}
