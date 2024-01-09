import { OWNERS } from '#root/config';
import { PermissionFlagsBits, type GuildMember } from 'discord.js';

export function isGuildModerator(member: GuildMember) {
	return isGuildOwner(member) || canBanMember(member) || canManageRoles(member) || canManageGuild(member);
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerId;
}

export function isGuildAdmin(member: GuildMember) {
	return member.permissions.has(PermissionFlagsBits.Administrator);
}

export function isBotAdmin(member: GuildMember) {
	return OWNERS.includes(member.id);
}

export function canBanMember(member: GuildMember) {
	return member.permissions.has(PermissionFlagsBits.BanMembers);
}

export function canManageRoles(member: GuildMember) {
	return member.permissions.has(PermissionFlagsBits.ManageRoles);
}

export function canManageGuild(member: GuildMember) {
	return member.permissions.has(PermissionFlagsBits.ManageGuild);
}
