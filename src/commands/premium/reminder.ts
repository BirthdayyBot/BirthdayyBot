import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import thinking from '../../lib/discord/thinking';
import replyToInteraction from '../../helpers/send/response';
import { InviteEmbed } from '../../lib/embeds';
import { inviteButton } from '../../lib/components/button';
import { ReminderCMD } from '../../lib/commands/reminder';

@ApplyOptions<Command.Options>({
	name: 'reminder',
	description: 'premium tryout',
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTYY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'], 'IsPremium' /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class GuideCommand extends Command {

	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(await ReminderCMD(), {
			guildIds: getCommandGuilds('testing'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = await generateEmbed(InviteEmbed);
		await replyToInteraction(interaction, {
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
