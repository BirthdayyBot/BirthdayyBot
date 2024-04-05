import { changeGuildDeleteQueueDelay, createGuildDeleteQueue, findGuildDeleteQueue } from '#lib/utils/functions/tasks';
import { BOT_SERVER_LOG, CLIENT_NAME, defaultEmbed, Emojis } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { Colors, EmbedBuilder, Guild, time, TimestampStyles } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildDelete })
export class UserEvent extends Listener<typeof Events.GuildDelete> {
	public async run(guild: Guild) {
		if (guild.available) return;

		// Remove the guild from the fetch queue
		this.container.client.guildMemberFetchQueue.remove(guild.shardId, guild.id);

		// Delete the guild from the database
		const task = await findGuildDeleteQueue(guild.id);
		if (task) await changeGuildDeleteQueueDelay(task);
		else await createGuildDeleteQueue(guild.id);

		// Log the guild deletion
		const embed = await this.buildEmbed(guild);
		const channel = await this.container.client.channels.fetch(BOT_SERVER_LOG);
		if (channel?.isTextBased()) await channel.send({ embeds: [embed] });

		this.container.logger.info(`[EVENT] ${Events.GuildDelete} - ${guild.name} (${guild.id})`);
	}

	private async buildEmbed(guild: Guild) {
		const embed = new EmbedBuilder(defaultEmbed())
			.setTitle(`${Emojis.Fail} ${CLIENT_NAME} got removed from a Guild`)
			.setDescription(`I am now in \`${await this.container.client.computeGuilds()}\` guilds`)
			.setColor(Colors.Red)
			.addFields([
				{ name: 'Name', value: guild.name, inline: true },
				{ name: 'Description', value: guild.description ?? 'No Description', inline: true },
				{ name: 'ID', value: guild.id, inline: true },
				{ name: 'MemberCount', value: guild.memberCount.toString(), inline: true },
				{ name: 'Owner', value: guild.ownerId, inline: true },
				{ name: 'Created At', value: guild.createdAt.toUTCString(), inline: true },
				{ name: 'Joined At', value: time(guild.joinedTimestamp, TimestampStyles.RelativeTime), inline: true },
			]);

		return embed;
	}
}
