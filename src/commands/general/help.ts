import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import replyToInteraction from '../../helpers/send/response';
import { HelpCMD } from '../../lib/commands';
import { HelpEmbed } from '../../lib/embeds';
import { docsButton, discordButton, websiteButton } from '../../lib/components/button';

@ApplyOptions<Command.Options>({
	name: 'help',
	description: 'Need help with my Commands?',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTYY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class HelpCommand extends Command {

	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(await HelpCMD(), {
			guildIds: getCommandGuilds('global'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = await generateEmbed(HelpEmbed);
		await replyToInteraction(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [websiteButton, docsButton, discordButton],
				},
			],
		});
	}
}
