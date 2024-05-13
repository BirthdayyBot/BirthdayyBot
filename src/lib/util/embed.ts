import { BrandingColors } from '#utils/constants';
import { BOT_AVATAR, CLIENT_NAME } from '#utils/environment';
import { envParseBoolean } from '@skyra/env-utilities';
import { Colors, type APIEmbed } from 'discord.js';

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
			text: `${CLIENT_NAME} ${envParseBoolean('CUSTOM_BOT') ? '👑' : ''}`,
			icon_url: BOT_AVATAR
		}
	};
}

export function interactionSuccess(description: string, ephemeral = false) {
	return {
		ephemeral,
		embeds: [
			{
				color: BrandingColors.Primary,
				description: `${description}`
			}
		]
	};
}

export function interactionProblem(description: string, ephemeral = false) {
	return {
		ephemeral,
		embeds: [
			{
				color: Colors.Red,
				description: `${description}`
			}
		]
	};
}
