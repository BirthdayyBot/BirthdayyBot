import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import replyToInteraction from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { InviteCMD } from '../../lib/commands';
import { inviteButton } from '../../lib/components/button';
import thinking from '../../lib/discord/thinking';
import { InviteEmbed } from '../../lib/embeds';

@ApplyOptions<Command.Options>({
	name: 'invite',
	description: 'Invite Birthdayy to your Discord Server!',
	enabled: true,
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTYY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'] /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class GuideCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(await InviteCMD(), {
			guildIds: getCommandGuilds('global'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateEmbed(InviteEmbed);
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
