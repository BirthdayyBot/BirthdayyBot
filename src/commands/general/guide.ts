import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { reply } from '../../helpers/send/response';
import { GuideCMD } from '../../lib/commands';
import { discordButton, docsButton } from '../../lib/components/button';
import thinking from '../../lib/discord/thinking';
import { GuideEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
	name: 'guide',
	description: "Need a quick setup Guide! Don't worry, this will help you!",
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTLY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class GuideCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(GuideCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(GuideEmbed);
		await reply(interaction, {
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
