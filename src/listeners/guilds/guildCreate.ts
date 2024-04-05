import { findGuildDeleteQueue } from '#lib/utils/functions/tasks';
import { BOT_SERVER_LOG, CLIENT_NAME, defaultEmbed, Emojis } from '#lib/utils/index';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendEmbeds, isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { container, Listener, type ListenerOptions } from '@sapphire/framework';
import { Colors, EmbedBuilder, Events, Guild, time, TimestampStyles } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildCreate })
export class UserEvent extends Listener<typeof Events.GuildCreate> {
	public async run(guild: Guild) {
		if (!guild.available) return;

		// Add the guild to the fetch queue
		this.container.client.guildMemberFetchQueue.add(guild.shardId, guild.id);

		// Remove the guild from the delete queue
		const deleteTask = await findGuildDeleteQueue(guild.id);
		if (deleteTask) await deleteTask.remove();

		// Log the guild addition
		const logEmbed = await this.buildEmbed(guild);
		const logChannel = await this.container.client.channels.fetch(BOT_SERVER_LOG);
		if (isGuildBasedChannel(logChannel) && canSendEmbeds(logChannel)) await logChannel.send({ embeds: [logEmbed] });

		container.logger.info(`[EVENT] ${Events.GuildCreate} - ${guild.name} (${guild.id})`);
	}

	private async buildEmbed(guild: Guild) {
		const embed = new EmbedBuilder(defaultEmbed())
			.setTitle(`${Emojis.Success} ${CLIENT_NAME} got added to a Guild`)
			.setDescription(`I am now in \`${await this.container.client.computeGuilds()}\` guilds`)
			.setColor(Colors.Green)
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
