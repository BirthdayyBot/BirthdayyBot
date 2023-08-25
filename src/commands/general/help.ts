import { HelpCMD } from '#lib/commands';
import { docsButtonBuilder, inviteSupportDicordButton, websiteButtonBuiler } from '#lib/components/button';
import thinking from '#lib/discord/thinking';
import { HelpEmbed } from '#lib/embeds';
import { generateDefaultEmbed, reply } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'help',
	description: 'Need help with my Commands?',
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel', 'UseApplicationCommands', 'SendMessages'],
	requiredClientPermissions: ['SendMessages', 'EmbedLinks', 'UseExternalEmojis'],
})
export class HelpCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(HelpCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(HelpEmbed);
		await reply({
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [
						await websiteButtonBuiler(interaction),
						await docsButtonBuilder(interaction),
						await inviteSupportDicordButton(interaction),
					],
				},
			],
		});
	}
}
