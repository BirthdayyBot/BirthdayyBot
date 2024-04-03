import { sendMessage } from '#lib/discord';
import { CLIENT_NAME, BOT_SERVER_LOG, Emojis, generateDefaultEmbed } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { DurationFormatter } from '@sapphire/duration';
import { Events, Listener, container, type ListenerOptions } from '@sapphire/framework';
import { Colors, Guild, time } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildDelete })
export class UserEvent extends Listener<typeof Events.GuildDelete> {
	public async run(guild: Guild) {
		if (guild.available) return;

		this.container.client.guildMemberFetchQueue.remove(guild.shardId, guild.id);
		await this.leaveServerLog(guild);
		await container.prisma.guild.delete({ where: { id: guild.id } });
	}

	private async leaveServerLog(guild: Guild) {
		container.logger.info('Removed from Guild');
		const { id: guildId, name, description, memberCount, ownerId, joinedTimestamp: rawJoinedTimestamp } = guild;
		const joinedAgo = time(Math.floor(rawJoinedTimestamp / 1000), 'f');
		const joinedDate = time(Math.floor(rawJoinedTimestamp / 1000), 'R');
		const timeServed = new DurationFormatter().format(Date.now() - rawJoinedTimestamp);
		const fields = [
			{ name: 'GuildName', value: `${name}` },
			{
				name: 'GuildID',
				value: `${guildId}`,
			},
		];

		if (description) fields.push({ name: 'GuildDescription', value: `${description}` });
		if (memberCount) fields.push({ name: 'GuildMemberCount', value: `${memberCount}` });
		if (ownerId) fields.push({ name: 'GuildOwnerID', value: `${ownerId}` });
		if (rawJoinedTimestamp) fields.push({ name: 'GuildJoinedTimestamp', value: `${joinedDate}\n${joinedAgo}` });
		if (timeServed) fields.push({ name: 'TimeServed', value: `${timeServed}` });

		const embed = generateDefaultEmbed({
			title: `${Emojis.Fail} ${CLIENT_NAME} got removed from a Guild`,
			description: `I am now in \`${await this.container.client.computeGuilds()}\` guilds`,
			fields,
			color: Colors.Red,
		});
		await sendMessage(BOT_SERVER_LOG, { embeds: [embed] });
	}
}
