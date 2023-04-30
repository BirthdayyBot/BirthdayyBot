import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import os from 'os';
import { PING } from '../../helpers/provide/environment';
import { reply } from '../../helpers/send/response';
import { getCurrentOffset } from '../../helpers/utils/date';
import { StatsCMD } from '../../lib/commands';
import thinking from '../../lib/discord/thinking';
import type { EmbedInformationModel } from '../../lib/model';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { isDevelopment } from '../../lib/utils/env';

@ApplyOptions<Command.Options>({
	name: 'stats',
	description: 'Stats Command',
	// TODO: Enable this when #71 is done
	enabled: isDevelopment,
	runIn: ['GUILD_TEXT'],
	requiredUserPermissions: ['ViewChannel'],
	requiredClientPermissions: ['SendMessages'],
})
export class StatsCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(StatsCMD());
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await thinking(interaction);
		const currentOffset = getCurrentOffset();
		const memoryUsageInPercent = Math.round((process.memoryUsage().heapUsed / os.totalmem()) * 100);
		const stats = {
			date: currentOffset.dateFormatted,
			offset: currentOffset?.utcOffset,
			servercount: await this.container.botList.computeGuilds(),
			ping: interaction.client.ws.ping,
			cpu: process.cpuUsage(),
			memory: {
				usage: memoryUsageInPercent,
				used: process.memoryUsage().heapUsed,
				total: os.totalmem(),
			},
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
					name: 'API Ping #TODO',
					value: `${date - interaction.createdTimestamp}ms`,
					inline: true,
				},
				{
					name: 'CPU Usage #TODO',
					value: `${stats.cpu.system.toLocaleString()}%`,
					inline: true,
				},
				{ name: 'Birthdays registered #TODO', value: '0', inline: true },
				{
					name: 'RAM Usage',
					value: `${stats.memory.usage}%`,
					inline: true,
				},
				{
					name: 'RAM Used',
					value: `${(stats.memory.used / 1024 / 1024).toFixed(2)}MB`,
					inline: true,
				},
				{
					name: 'RAM Total',
					value: `${(stats.memory.total / 1024 / 1024).toFixed(2)}MB`,
					inline: true,
				},
			],
		};
		const embed = generateDefaultEmbed(embedRaw);
		return reply(interaction, { embeds: [embed] });
	}
}
