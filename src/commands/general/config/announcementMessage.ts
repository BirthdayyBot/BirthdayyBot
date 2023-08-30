import { defaultUserPermissions } from '#lib/types/permissions';
import { interactionProblem, interactionSuccess } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { RequiresUserPermissions } from '@sapphire/decorators';
import { annoncementMessageConfigSubCommand } from './config.js';

@RegisterSubCommand('config', (builder) => annoncementMessageConfigSubCommand(builder))
export class AnnouncementMessageCommand extends Command {
	@RequiresUserPermissions(defaultUserPermissions.add('ManageGuild'))
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const message = interaction.options.getString('message', true);

		const guild = await this.container.prisma.guild.findUniqueOrThrow({
			where: { guildId: interaction.guildId },
		});

		if (!guild.premium)
			return interactionProblem(interaction, 'commands/config:announcementMessage.requirePremium');

		await this.container.prisma.guild.upsert({
			create: { guildId: interaction.guildId, announcementMessage: message },
			where: { guildId: interaction.guildId },
			update: { announcementMessage: message },
		});

		return interactionSuccess(interaction, 'commands/config:announcementMessage.success');
	}
}
