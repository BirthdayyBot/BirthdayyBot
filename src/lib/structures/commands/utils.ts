import { PermissionFlagsBits } from 'discord-api-types/v10';

export const DEFAULT_REQUIRED_CLIENT_PERMISSIONS = [
	PermissionFlagsBits.SendMessages,
	PermissionFlagsBits.EmbedLinks,
	PermissionFlagsBits.ViewChannel,
];
