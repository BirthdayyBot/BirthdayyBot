import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { reply } from '../../helpers/send/response';
import { InviteCMD } from '../../lib/commands';
import { inviteBirthdayyButton } from '../../lib/components/button';
import thinking from '../../lib/discord/thinking';
import { InviteEmbed } from '../../lib/embeds';
import { generateDefaultEmbed } from '../../lib/utils/embed';

@ApplyOptions<Command.Options>({
	name: 'invite',
	description: 'Invite Birthdayy to your Discord Server!',
	enabled: true,
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
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
					components: [await inviteBirthdayyButton(interaction)],
				},
			],
		});
	}
}
