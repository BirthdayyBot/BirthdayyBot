import { ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

export async function InviteCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'invite',
		description: 'Invite Birthdayy to your Discord Server!',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: true,
		options: [],
	};
}
