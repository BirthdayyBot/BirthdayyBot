import thinking from '#lib/discord/thinking';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { generateBirthdayList } from '#utils/birthday';
import { generateDefaultEmbed } from '#utils/embed';
import { reply } from '#utils/utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext, RequiresUserPermissions } from '@sapphire/decorators';
import { listBirthdaySubCommand } from './birthday';

@RegisterSubCommand('birthday', (builder) => listBirthdaySubCommand(builder))
export class ListCommand extends Command {
	@RequiresGuildContext()
	@RequiresUserPermissions(defaultUserPermissions)
	@RequiresClientPermissions(defaultClientPermissions)
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guild);

		return reply({ components, embeds: [generateDefaultEmbed(embed)] });
	}
}
