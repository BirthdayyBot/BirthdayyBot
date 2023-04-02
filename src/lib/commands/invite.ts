import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export function InviteCMD(): ChatInputApplicationCommandData {
	return {
		name: 'invite',
		description: 'Invite Birthdayy to your Discord Server!',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
		options: [],
	};
}
