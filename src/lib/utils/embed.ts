import { replyToInteraction } from '#lib/discord/interaction';
import { BOT_AVATAR, CLIENT_NAME } from '#utils/environment';
import { container } from '@sapphire/framework';
import { envParseBoolean } from '@skyra/env-utilities';
import { type APIEmbed, type ChatInputCommandInteraction, Colors } from 'discord.js';

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
		footer: {
			icon_url: BOT_AVATAR,
			text: `${CLIENT_NAME ?? container.client.user?.globalName} ${envParseBoolean('CUSTOM_BOT') ? '👑' : ''}`
		},
		timestamp: new Date().toISOString()
	};
}

export function interactionSuccess(interaction: ChatInputCommandInteraction, description: string, ephemeral = false) {
	return replyToInteraction(interaction, {
		embeds: [
			{
				color: BrandingColors.Primary,
				description: `${description}`
			}
		],
		ephemeral
	});
}

export function interactionProblem(interaction: ChatInputCommandInteraction, description: string, ephemeral = false) {
	return replyToInteraction(interaction, {
		embeds: [
			{
				color: Colors.Red,
				description: `${description}`
			}
		],
		ephemeral
	});
}
