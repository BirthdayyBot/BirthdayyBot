import type { DMChannel, Guild, GuildMember, GuildTextBasedChannel, Message } from 'discord.js';

export interface GuildMessage extends Message {
	channel: GuildTextBasedChannel;
	readonly guild: Guild;
	readonly member: GuildMember;
}

export interface DMMessage extends Message {
	channel: DMChannel;
	readonly guild: null;
	readonly member: null;
}
