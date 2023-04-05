import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import os from 'os';
import generateEmbed from '../../helpers/generate/embed';
import { APP_ENV, PING } from '../../helpers/provide/environment';
import getGuildCount from '../../helpers/provide/guildCount';
import replyToInteraction from '../../helpers/send/response';
import { getCurrentDateFormated, getCurrentOffset } from '../../helpers/utils/date';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { StatsCMD } from '../../lib/commands';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model';

@ApplyOptions<Command.Options>({
	name: 'stats',
	description: 'Stats Command',
	// TODO: Enable this when #71 is done
	enabled: APP_ENV !== 'prd',
	runIn: ['GUILD_TEXT'],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class StatsCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(StatsCMD(), {
			guildIds: getCommandGuilds('global'),
			registerCommandIfMissing: true,
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const dateObject = getCurrentOffset();
		const todayUTC = getCurrentDateFormated();
		const memoryUsageInPercent = Math.round((process.memoryUsage().heapUsed / os.totalmem()) * 100);
		const stats = {
			date: todayUTC,
			offset: dateObject?.utcOffset,
			servercount: getGuildCount(),
			ping: interaction.client.ws.ping,
			cpu: process.cpuUsage(),
			memory: memoryUsageInPercent,
		};
		const date = Date.now();
		const embedRaw: EmbedInformationModel = {
			title: `${PING} Current Stats`,
			description: "This is the overview of the bot's current stats.",
			fields: [
				{
					name: 'Date',
					value: `${stats.date}`,
					inline: true,
				},
				{
					name: 'Offset',
					value: `${stats.offset ?? 'Unknown'}`,
					inline: true,
				},
				{
					name: 'Next Offset',
					value: `${stats.offset === -11 ? 12 : stats.offset! - 1}`,
					inline: true,
				},

				{
					name: 'Servercount',
					value: `${stats.servercount}`,
					inline: true,
				},
				{
					name: 'Uptime',
					value: `${process.uptime().toFixed(2)}s`,
					inline: true,
				},
				{
					name: 'Bot Ping',
					value: `${stats.ping}ms`,
					inline: true,
				},
				{
					name: 'API Ping',
					value: `${date - interaction.createdTimestamp}ms`,
					inline: true,
				},
				{
					name: 'CPU Usage',
					value: `${stats.cpu.system.toFixed(2)}%`,
					inline: true,
				},
				{
					name: 'RAM Usage',
					value: `${stats.memory}%`,
					inline: true,
				},
			],
		};
		const embed = generateEmbed(embedRaw);
		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
