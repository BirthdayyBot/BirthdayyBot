import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import os from 'os';
import generateEmbed from '../../helpers/generate/embed';
import { APP_ENV, PING } from '../../helpers/provide/environment';
import getGuildCount from '../../helpers/provide/guildCount';
import replyToInteraction from '../../helpers/send/response';
import { getCurrentDate, getCurrentDateFormated, getCurrentOffset } from '../../helpers/utils/date';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { StatusCMD } from '../../lib/commands';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model';

@ApplyOptions<Command.Options>({
	name: 'status',
	description: 'Status Command',
	// TODO: Enable this when #71 is done
	enabled: APP_ENV !== 'prd',
	runIn: ['GUILD_TEXT'],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages']
})
export class StatusCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(StatusCMD(), {
			guildIds: getCommandGuilds('global'),
			registerCommandIfMissing: true
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const dateObject = getCurrentOffset();
		const todayUTC = getCurrentDateFormated();
		const memoryUsageInPercent = Math.round((process.memoryUsage().heapUsed / os.totalmem()) * 100);
		const status = {
			date: todayUTC,
			offset: dateObject?.timezone,
			servercount: getGuildCount(),
			ping: interaction.client.ws.ping,
			cpu: process.cpuUsage(),
			memory: memoryUsageInPercent
		};
		const date = Date.now();
		const embedRaw: EmbedInformationModel = {
			title: `${PING} Current Status`,
			description: "This is the overview of the bot's current stats.",
			fields: [
				{
					name: 'Date',
					value: `${status.date}`,
					inline: true
				},
				{
					name: 'Offset',
					value: `${status.offset ?? 'Unknown'}`,
					inline: true
				},
				{
					name: 'Next Offset',
					value: `${status.offset === -11 ? 12 : status.offset! - 1}`,
					inline: true
				},

				{
					name: 'Servercount',
					value: `${status.servercount}`,
					inline: true
				},
				{
					name: 'Uptime',
					value: `${process.uptime().toFixed(2)}s`,
					inline: true
				},
				{
					name: 'Bot Ping',
					value: `${status.ping}ms`,
					inline: true
				},
				{
					name: 'API Ping',
					value: `${date - interaction.createdTimestamp}ms`,
					inline: true
				},
				{
					name: 'CPU Usage',
					value: `${status.cpu.system.toFixed(2)}%`,
					inline: true
				},
				{
					name: 'RAM Usage',
					value: `${status.memory}%`,
					inline: true
				}
			]
		};
		const embed = generateEmbed(embedRaw);
		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
