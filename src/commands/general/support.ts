import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import replyToInteraction from '../../helpers/send/response';
import { SupportCMD } from '../../lib/commands';
import { SupportEmbed } from '../../lib/embeds';
import { discordButton, docsButton } from '../../lib/components/button';

@ApplyOptions<Command.Options>({
	name: 'support',
	description: 'Need help? Join my Support Discord Server!',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTYY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class SupportCommand extends Command {

	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(await SupportCMD(), {
			guildIds: getCommandGuilds('global'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateEmbed(SupportEmbed);
		await replyToInteraction(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [discordButton, docsButton],
				},
			],
		});
	}
}
