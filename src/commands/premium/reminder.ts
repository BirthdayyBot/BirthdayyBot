import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { reply } from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { ReminderCMD } from '../../lib/commands/reminder';
import { inviteButton } from '../../lib/components/button';
import thinking from '../../lib/discord/thinking';
import { InviteEmbed } from '../../lib/embeds';
import { generateDefaultEmbed } from '../../lib/utils/embed';

@ApplyOptions<Command.Options>({
	name: 'reminder',
	description: 'premium tryout',
	// runIn: ['GUILD_TEXT', 'DM'], CURRENTLY BROKEN
	preconditions: [['DMOnly', 'GuildTextOnly'], 'GuildPremium' /* any other preconditions here */],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class GuideCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(ReminderCMD(), {
			guildIds: await getCommandGuilds('testing'),
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(InviteEmbed);
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
