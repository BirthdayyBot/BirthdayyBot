import { OWNERS } from '#root/config';
import { PermissionFlagsBits, type GuildMember } from 'discord.js';

export function isOwner(member: GuildMember) {
	return OWNERS.includes(member.id);
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerId;
}

export function isAdmin(member: GuildMember) {
	return isGuildOwner(member) ?? checkAdministrator(member);
}

export function isModerator(member: GuildMember) {
	return isAdmin(member) ?? checkModerator(member);
}

function checkModerator(member: GuildMember) {
	return member.permissions.has(PermissionFlagsBits.BanMembers);
}

function checkAdministrator(member: GuildMember) {
	return member.permissions.has(PermissionFlagsBits.ManageGuild);
}
