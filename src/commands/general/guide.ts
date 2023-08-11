import { GuideCMD } from '#lib/commands';
import { docsButtonBuilder, inviteSupportDicordButton } from '#lib/components/button';
import thinking from '#lib/discord/thinking';
import { GuideEmbed } from '#lib/embeds';
import { generateDefaultEmbed } from '#lib/utils/embed';
import { reply } from '#lib/utils/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'guide',
	description: "Need a quick setup Guide! Don't worry, this will help you!",
	preconditions: [['DMOnly', 'GuildTextOnly']],
	requiredUserPermissions: ['ViewChannel', 'UseApplicationCommands', 'SendMessages'],
	requiredClientPermissions: ['SendMessages', 'EmbedLinks', 'UseExternalEmojis'],
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
					components: [await docsButtonBuilder(interaction), await inviteSupportDicordButton(interaction)],
				},
			],
		});
	}
}
