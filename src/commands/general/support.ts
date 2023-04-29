import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import replyToInteraction from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { SupportCMD } from '../../lib/commands';
import { discordButton, docsButton } from '../../lib/components/button';
import thinking from '../../lib/discord/thinking';
import { SupportEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
	name: 'support',
	description: 'Need help? Join my Support Discord Server!',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTLY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class SupportCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(SupportCMD(), {
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
