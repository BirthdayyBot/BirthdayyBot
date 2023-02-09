import { PermissionFlagsBits } from 'discord.js';

export async function InviteCMD() {
	return {
		name: 'invite',
		description: 'Invite Birthdayy to your Discord Server!',
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], //https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
		dmPermission: true,
		options: []
	};
}
