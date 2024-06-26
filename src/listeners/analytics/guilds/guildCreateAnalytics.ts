import { AnalyticsListener } from '#lib/structures';
import { Actions, Points, Tags, Events } from '#lib/types';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';
import type { Guild } from 'discord.js';

@ApplyOptions<AnalyticsListener.Options>({ event: Events.GuildCreate })
export class UserAnalyticsEvent extends AnalyticsListener {
	public run(guild: Guild) {
		const guilds = new Point(Points.Guilds)
			.tag(Tags.Shard, guild.shardId.toString())
			.tag(Tags.Action, Actions.Addition)
			// TODO: Adjust for traditional sharding
			.intField('value', guild.client.guilds.cache.size);
		const users = new Point(Points.Users)
			.tag(Tags.Shard, guild.shardId.toString())
			.tag(Tags.Action, Actions.Addition)
			// TODO: Adjust for traditional sharding
			.intField(
				'value',
				guild.client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0)
			);

		return this.writePoints([guilds, users]);
	}
}
