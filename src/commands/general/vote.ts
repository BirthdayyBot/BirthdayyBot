import { VoteCMD } from '#lib/commands';
import thinking from '#lib/discord/thinking';
import { VoteEmbed } from '#lib/embeds';
import { generateDefaultEmbed, reply } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'vote',
	description: 'Vote for Birthdayy <3',
	requiredUserPermissions: ['ViewChannel', 'UseApplicationCommands', 'SendMessages'],
	requiredClientPermissions: ['SendMessages', 'EmbedLinks', 'UseExternalEmojis'],
})
export class VoteCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(VoteCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(VoteEmbed);
		return reply(interaction, {
			embeds: [embed],
		});
	}
}
