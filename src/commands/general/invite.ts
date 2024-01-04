import { InviteCMD } from '#lib/commands/invite';
import { inviteButton } from '#lib/components/button';
import thinking from '#lib/discord/thinking';
import { InviteEmbed } from '#lib/embeds';
import { generateDefaultEmbed } from '#lib/utils/embed';
import { reply } from '#root/helpers/index';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'invite',
	description: 'Invite Birthdayy to your Discord Server!',
	enabled: true,
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages']
})
export class GuideCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(InviteCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = generateDefaultEmbed(InviteEmbed);
		await reply(interaction, {
			embeds: [embed],
			components: [
				{
					type: 1,
					components: [inviteButton]
				}
			]
		});
	}
}
