import { replyToInteraction } from '#lib/discord/interaction';
import { BOT_AVATAR, CLIENT_NAME } from '#utils/environment';
import { container } from '@sapphire/framework';
import { envParseBoolean } from '@skyra/env-utilities';
import { Colors, type APIEmbed, type ChatInputCommandInteraction } from 'discord.js';
import { BrandingColors } from './constants.js';

export function generateDefaultEmbed(embed: APIEmbed): APIEmbed {
	return {
		...defaultEmbed(),
		...embed
	};
}

export function defaultEmbed(): APIEmbed {
	return {
		color: BrandingColors.Primary,
		timestamp: new Date().toISOString(),
		footer: {
			text: `${CLIENT_NAME ?? container.client.user?.globalName} ${envParseBoolean('CUSTOM_BOT') ? '👑' : ''}`,
			icon_url: BOT_AVATAR
		}
	};
}

export function interactionSuccess(interaction: ChatInputCommandInteraction, description: string, ephemeral = false) {
	return replyToInteraction(interaction, {
		ephemeral,
		embeds: [
			{
				color: BrandingColors.Primary,
				description: `${description}`
			}
		]
	});
}

export function interactionProblem(interaction: ChatInputCommandInteraction, description: string, ephemeral = false) {
	return replyToInteraction(interaction, {
		ephemeral,
		embeds: [
			{
				color: Colors.Red,
				description: `${description}`
			}
		]
	});
}
