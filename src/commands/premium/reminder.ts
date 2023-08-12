import { ReminderCMD } from '#lib/commands/reminder';
import { inviteBirthdayyButton } from '#lib/components/button';
import thinking from '#lib/discord/thinking';
import { InviteEmbed } from '#lib/embeds';
import { generateDefaultEmbed } from '#utils/embed';
import { getCommandGuilds } from '#utils/functions';
import { reply } from '#utils/utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'reminder',
	description: 'premium tryout',
	enabled: false,
	preconditions: ['GuildPremium'],
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
		await reply({
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [await inviteBirthdayyButton(interaction)],
				},
			],
		});
	}
}
