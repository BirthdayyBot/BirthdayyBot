import { BOT_ADMINS } from '#lib/utils/environment';
import type { PermissionsBitField } from 'discord.js';

export function canManageRoles(permissions: PermissionsBitField | null | undefined): boolean {
	if (!permissions) return false;
	return permissions.has('ManageRoles');
}

export function isBotAdmin(userId: string): boolean {
	return BOT_ADMINS.includes(userId);
}
