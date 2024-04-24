import type { GuildMember, Message } from 'discord.js';

export type GuildMessage = { member: GuildMember } & Message<true>;
export type DMMessage = Message<false>;
