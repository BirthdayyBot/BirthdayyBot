import { ReminderCMD } from '#lib/commands/reminder';
import { getCommandGuilds } from '#utils/functions';
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

	public override async chatInputRun(_interaction: Command.ChatInputCommandInteraction) {}
}
