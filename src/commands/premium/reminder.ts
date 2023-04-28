import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { generateEmbed } from '../../helpers/generate/embed';
import { reply } from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { ReminderCMD } from '../../lib/commands/reminder';
import { inviteButton } from '../../lib/components/button';
import thinking from '../../lib/discord/thinking';
import { InviteEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
	name: 'reminder',
	description: 'premium tryout',
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTLY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'], 'IsPremium' /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class GuideCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(ReminderCMD(), {
			guildIds: getCommandGuilds('testing'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateEmbed(InviteEmbed);
		await reply(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [inviteButton],
				},
			],
		});
	}
}
