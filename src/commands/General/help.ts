import { HelpCMD } from '#lib/commands/help';
import { docsButtonBuilder, inviteSupportDiscordButton, websiteButtonBuilder } from '#lib/components/button';
import { HelpEmbed } from '#lib/embeds';
import { BirthdayyCommand } from '#lib/structures';
import { generateDefaultEmbed } from '#utils/embed';
import { ApplicationCommandRegistry } from '@sapphire/framework';

export class HelpCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(HelpCMD());
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const embed = generateDefaultEmbed(HelpEmbed);
		await interaction.reply({
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [
						await websiteButtonBuilder(interaction),
						await docsButtonBuilder(interaction),
						await inviteSupportDiscordButton(interaction)
					]
				}
			]
		});
	}
}
