import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import replyToInteraction from '../../helpers/send/response';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { StatusCMD } from '../../lib/commands';
import thinking from '../../lib/discord/thinking';

@ApplyOptions<Command.Options>({
	name: 'status',
	description: 'Status Command',
	runIn: ['GUILD_TEXT'],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class StatusCommand extends Command {
	public override async registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(await StatusCMD(), {
			guildIds: getCommandGuilds('global'),
			registerCommandIfMissing: true,
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const embed = await generateEmbed({ title: 'Status', description: 'A Status Command' });
		return await replyToInteraction(interaction, { embeds: [embed] });
	}
}
