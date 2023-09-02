import { Colors, type APIEmbed, type ChatInputCommandInteraction } from 'discord.js';
import { BOT_COLOR, BOT_NAME, IS_CUSTOM_BOT, BOT_AVATAR } from '#utils/environment';
import { replyToInteraction } from '#lib/discord/interaction';
import { resolveKey, type StringMap, type TOptions } from '@sapphire/plugin-i18next';
import type { NonNullObject } from '@sapphire/utilities';

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

export async function interactionSuccess<T extends NonNullObject = StringMap>(
	interaction: ChatInputCommandInteraction,
	key: string,
	options?: TOptions<T>,
	ephemeral = false,
) {
	return replyToInteraction(interaction, {
		ephemeral,
		embeds: [
			{
				color: Colors.Green,
				description: `${await resolveKey(interaction, key, options)}`,
			},
		],
	});
}

export async function interactionProblem<T extends NonNullObject = StringMap>(
	interaction: ChatInputCommandInteraction,
	key: string,
	options?: TOptions<T>,
	ephemeral = false,
) {
	return replyToInteraction(interaction, {
		ephemeral,
		embeds: [
			{
				color: Colors.Red,
				description: `${await resolveKey(interaction, key, options)}`,
			},
		],
	});
}
