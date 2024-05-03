import { StatsCMD } from '#lib/commands';
import thinking from '#lib/discord/thinking';
import { BirthdayyCommand } from '#lib/structures';
import { Emojis, generateDefaultEmbed, isDevelopment } from '#utils';
import { getCurrentOffset } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import type { APIEmbed } from 'discord.js';
import { totalmem } from 'os';

@ApplyOptions<BirthdayyCommand.Options>({
	name: 'stats',
	description: 'Stats Command',
	enabled: isDevelopment,
})
export class StatsCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(StatsCMD());
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		await thinking(interaction);
		const currentOffset = getCurrentOffset();
		const memoryUsageInPercent = Math.round((process.memoryUsage().heapUsed / totalmem()) * 100);
		const stats = {
			date: currentOffset.dateFormatted,
			offset: currentOffset?.utcOffset,
			servercount:
				(await this.container.client.shard?.broadcastEval((client) => client.guilds.cache.size))?.reduce(
					(acc, val) => acc + val,
					0,
				) ?? this.container.client.guilds.cache.size,
			ping: interaction.client.ws.ping,
			cpu: process.cpuUsage(),
			memory: {
				usage: memoryUsageInPercent,
				used: process.memoryUsage().heapUsed,
				total: totalmem(),
			},
		};
		const date = Date.now();
		const embedRaw: APIEmbed = {
			title: `${Emojis.Ping} Current Stats`,
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
		return interaction.reply({ embeds: [embed] });
	}
}
