import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { reply } from '../../helpers/send/response';
import { VoteCMD } from '../../lib/commands/vote';
import thinking from '../../lib/discord/thinking';
import { VoteEmbed } from '../../lib/embeds';
import { generateDefaultEmbed } from '../../lib/utils/embed';

@ApplyOptions<Command.Options>({
	name: 'vote',
	description: 'Vote for Birthdayy <3',
	enabled: true,
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class VoteCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(VoteCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(VoteEmbed);
		await reply(interaction, {
			embeds: [embed],
		});
	}
}
