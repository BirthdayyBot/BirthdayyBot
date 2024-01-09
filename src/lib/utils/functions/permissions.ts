import { OWNERS } from '#root/config';
import { PermissionFlagsBits, type GuildMember } from 'discord.js';

export function isGuildManager(member: GuildMember) {
	return isGuildModerator(member) || canManageGuild(member);
}

export function isGuildModerator(member: GuildMember) {
	return canBanMember(member) || canManageRoles(member);
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerId;
}

export function isGuildAdministrator(member: GuildMember) {
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
