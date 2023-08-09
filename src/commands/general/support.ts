import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { reply } from '../../helpers/send/response';
import { SupportCMD } from '../../lib/commands';
import { discordInformationButtonBuilder, docsButtonBuilder } from '../../lib/components/button';
import thinking from '../../lib/discord/thinking';
import { SupportEmbed } from '../../lib/embeds';
import { generateDefaultEmbed } from '../../lib/utils/embed';

@ApplyOptions<Command.Options>({
	name: 'support',
	description: 'Need help? Join my Support Discord Server!',
	enabled: true,
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class SupportCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(SupportCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(SupportEmbed);
		await reply(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [
						await discordInformationButtonBuilder(interaction),
						await docsButtonBuilder(interaction),
					],
				},
			],
		});
	}
}
