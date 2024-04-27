import { replyToInteraction } from '#lib/discord/interaction';
import { BOT_AVATAR, CLIENT_COLOR, CLIENT_NAME } from '#utils/environment';
import { container } from '@sapphire/framework';
import { envParseBoolean } from '@skyra/env-utilities';
import { type APIEmbed, type ChatInputCommandInteraction, Colors, EmbedBuilder } from 'discord.js';

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

export function successEmbed(description: string): EmbedBuilder {
	return new EmbedBuilder() //
		.setColor(CLIENT_COLOR)
		.setDescription(description);
}

export function errorEmbed(description: string): EmbedBuilder {
	return new EmbedBuilder() //
		.setColor(Colors.Red)
		.setDescription(description);
}

export function infoEmbed(description: string): EmbedBuilder {
	return new EmbedBuilder() //
		.setColor(Colors.Blue)
		.setDescription(description);
}
