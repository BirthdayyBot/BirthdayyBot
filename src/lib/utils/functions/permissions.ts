import { PermissionsBitField, type GuildMember } from 'discord.js';
import { OWNERS } from '#root/config';

export function isModerator(member: GuildMember) {
	return isGuildOwner(member) || checkModerator(member) || checkAdministrator(member);
}

export function isAdmin(member: GuildMember) {
	return isGuildOwner(member) || checkAdministrator(member);
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerId;
}

export function isOwner(member: GuildMember) {
	return OWNERS.includes(member.id);
}

function checkModerator(member: GuildMember) {
	return member.permissions.has(PermissionsBitField.Flags.BanMembers);
}

function checkAdministrator(member: GuildMember) {
	return member.permissions.has(PermissionsBitField.Flags.ManageGuild);
}
