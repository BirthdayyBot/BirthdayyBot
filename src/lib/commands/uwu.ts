import { PermissionFlagsBits } from 'discord.js';

export async function UwUCMD() {
	return {
		name: 'uwu',
		description: 'UwU Command',
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel], // https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
		dmPermission: false,
		options: [
			{
				type: 1,
				name: 'once',
				description: 'Send one uwu',
			},
			{
				type: 1,
				name: 'times',
				description: 'Send multiple uwus',
				options: [
					{
						type: 4,
						name: 'times',
						description: 'How many UwUs to send',
					},
				],
			},
			{
				type: 1,
				name: 'random',
				description: 'Random added fields',
				options: [
					{
						type: 6,
						name: 'user',
						description: 'Send a UwU to a user',
						required: true,
					},
				],
			},
			{
				type: 1,
				name: 'fetch',
				description: 'Fetch a user',
			},
		],
	};
}
