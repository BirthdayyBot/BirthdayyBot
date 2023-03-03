import { PermissionFlagsBits } from 'discord.js';

export async function ReminderCMD() {
	return {
		name: 'reminder',
		description: 'Reminder Command',
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], //https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
		dmPermission: false,
		options: [
			{
				type: 1,
				name: 'test',
				description: 'its a test'
			}
		]
	};
}
