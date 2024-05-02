import { HelpCMD } from '#lib/commands';
import { docsButtonBuilder, inviteSupportDicordButton, websiteButtonBuiler } from '#lib/components/button';
import { HelpEmbed } from '#lib/embeds';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { generateDefaultEmbed, reply } from '#utils';

export class HelpCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand(HelpCMD());
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
		const embed = generateDefaultEmbed(HelpEmbed);
		await reply(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [
						await websiteButtonBuiler(interaction),
						await docsButtonBuilder(interaction),
						await inviteSupportDicordButton(interaction)
					]
				}
			]
		});
	}
}
