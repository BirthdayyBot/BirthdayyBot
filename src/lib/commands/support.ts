import { PermissionFlagsBits } from 'discord.js';

export async function SupportCMD() {
	return {
		name: 'support',
		description: 'Need help? Join my Support Discord Server!',
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], //https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
		dmPermission: true,
		options: []
	};
}
