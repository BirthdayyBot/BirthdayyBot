import { HelpCMD } from '#lib/commands/help';
import { websiteButton, docsButton, discordButton } from '#lib/components/button';
import thinking from '#lib/discord/thinking';
import { HelpEmbed } from '#lib/embeds';
import { generateDefaultEmbed } from '#lib/utils/embed';
import { reply } from '#root/helpers/index';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'help',
	description: 'Need help with my Commands?',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTLY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages']
})
export class HelpCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(HelpCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(HelpEmbed);
		await reply(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [websiteButton, docsButton, discordButton]
				}
			]
		});
	}
}
