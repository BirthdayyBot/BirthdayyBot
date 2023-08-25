import thinking from '#lib/discord/thinking';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { generateBirthdayList } from '#utils/birthday';
import { generateDefaultEmbed, reply } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresClientPermissions, RequiresGuildContext, RequiresUserPermissions } from '@sapphire/decorators';
import { listBirthdaySubCommand } from './birthday.js';

@RegisterSubCommand('birthday', (builder) => listBirthdaySubCommand(builder))
export class ListCommand extends Command {
	@RequiresGuildContext()
	@RequiresUserPermissions(defaultUserPermissions)
	@RequiresClientPermissions(defaultClientPermissions)
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guild);

		return reply(interaction, { components, embeds: [generateDefaultEmbed(embed)] });
	}
}
