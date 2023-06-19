import type { PermissionsBitField } from 'discord.js';

export function canManageRoles(permissions: PermissionsBitField | null | undefined): boolean {
	if (!permissions) return false;
	return permissions.has('ManageRoles');
}
