import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	PermissionFlagsBits,
	type ChatInputApplicationCommandData
} from 'discord.js';

export function GuildInfoCMD(): ChatInputApplicationCommandData {
	return {
		name: 'guild-info',
		description: 'Get Infos about a Guild',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: 'guild-id',
				description: 'The GuildId',
				required: true
			}
		]
	};
}
