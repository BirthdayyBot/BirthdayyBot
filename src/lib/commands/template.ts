import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputApplicationCommandData, PermissionFlagsBits } from 'discord.js';

/*
    Permission Documentation: https://discord.js.org/#/docs/discord.js/v13/typedef/PermissionResolvable
    ApplicationCommandOptionType Documentation: https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
    ApplicationCommandType Documentation: https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
    */
export async function TemplateCMD(): Promise<ChatInputApplicationCommandData> {
	return {
		name: 'template',
		description: 'Template Command',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.ViewChannel],
		dmPermission: false,
		options: [
			{
				type: ApplicationCommandOptionType.Subcommand,
				name: 'template',
				description: 'its a template',
			},
		],
	};
}
