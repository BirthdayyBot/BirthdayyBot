import { replyToInteraction } from '#lib/discord/interaction';
import { BOT_AVATAR, BOT_COLOR, BOT_NAME, IS_CUSTOM_BOT } from '#utils/environment';
import { Colors, type APIEmbed, type ChatInputCommandInteraction } from 'discord.js';

export function generateDefaultEmbed(embed: APIEmbed): APIEmbed {
	return {
		...defaultEmbed(),
		...embed,
	};
}

export function defaultEmbed(): APIEmbed {
	return {
		color: BOT_COLOR,
		timestamp: new Date().toISOString(),
		footer: {
			text: `${BOT_NAME} ${IS_CUSTOM_BOT ? '👑' : ''}`,
			icon_url: BOT_AVATAR,
		},
	};
}

export function interactionSuccess(interaction: ChatInputCommandInteraction, description: string, ephemeral = false) {
	return replyToInteraction(interaction, {
		ephemeral,
		embeds: [
			{
				color: BOT_COLOR,
				description: `${description}`,
			},
		],
	});
}

export function interactionProblem(interaction: ChatInputCommandInteraction, description: string, ephemeral = false) {
	return replyToInteraction(interaction, {
		ephemeral,
		embeds: [
			{
				color: Colors.Red,
				description: `${description}`,
			},
		],
	});
}
