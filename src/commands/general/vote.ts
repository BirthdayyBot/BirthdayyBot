import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import reply from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { VoteCMD } from '../../lib/commands/vote';
import thinking from '../../lib/discord/thinking';
import { VoteEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
	name: 'vote',
	description: 'Vote for Birthdayy <3',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTYY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class VoteCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(VoteCMD(), {
			guildIds: getCommandGuilds('global'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateEmbed(VoteEmbed);
		await reply(interaction, {
			embeds: [embed],
		});
	}
}
