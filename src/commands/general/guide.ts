import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import replyToInteraction from '../../helpers/send/response';
import { GuideCMD } from '../../lib/commands';
import { GuideEmbed } from '../../lib/embeds';
import { discordButton, docsButton } from '../../lib/components/button';

@ApplyOptions<Command.Options>({
	name: 'guide',
	description: 'Need a quick setup Guide! Don\'t worry, this will help you!',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTYY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class GuideCommand extends Command {

	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(await GuideCMD(), {
			guildIds: getCommandGuilds('global'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = await generateEmbed(GuideEmbed);
		await replyToInteraction(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [docsButton, discordButton],
				},
			],
		});
	}
}
