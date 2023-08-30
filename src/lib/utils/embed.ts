import type { APIEmbed, ChatInputCommandInteraction, Message } from 'discord.js';
import { BOT_COLOR, BOT_NAME, IS_CUSTOM_BOT, BOT_AVATAR, Emojis } from '#utils/environment';
import { replyToInteraction } from '#lib/discord/interaction';
import { resolveKey, type StringMap, type Target, type TOptions } from '@sapphire/plugin-i18next';
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

export type APIEmbedWithoutDefault = Omit<APIEmbed, 'timestamp' | 'footer'>;

export async function success<T extends NonNullObject = StringMap>(
	target: Target,
	key: string,
	options?: TOptions<T>,
): Promise<APIEmbed> {
	return {
		...defaultEmbed(),
		description: `${Emojis.Success} ${await resolveKey(target, key, options)}`,
	};
}

export async function messageSuccess<T extends NonNullObject = StringMap>(
	message: Message,
	key: string,
	options?: TOptions<T>,
) {
	return message[message.editable ? 'edit' : 'reply']({
		content: '',
		embeds: [await success(message, key, options)],
		components: [],
	});
}

export async function interactionSuccess<T extends NonNullObject = StringMap>(
	interaction: ChatInputCommandInteraction,
	message: string,
	options?: TOptions<T>,
	ephemeral = true,
) {
	return replyToInteraction(interaction, {
		content: '',
		embeds: [await success(interaction, message, options)],
		components: [],
		ephemeral,
	});
}

export async function problem<T extends NonNullObject = StringMap>(
	target: Target,
	key: string,
	options?: TOptions<T>,
): Promise<APIEmbed> {
	return {
		...defaultEmbed(),
		description: `${Emojis.Fail} ${await resolveKey(target, key, options)}`,
	};
}

export async function messageProblem<T extends NonNullObject = StringMap>(
	message: Message,
	key: string,
	options?: TOptions<T>,
) {
	return message[message.editable ? 'edit' : 'reply']({
		content: '',
		embeds: [await problem(message, key, options)],
		components: [],
	});
}

export async function interactionProblem<T extends NonNullObject = StringMap>(
	interaction: ChatInputCommandInteraction,
	message: string,
	options?: TOptions<T>,
	ephemeral = true,
) {
	return replyToInteraction(interaction, {
		content: '',
		embeds: [await problem(interaction, message, options)],
		components: [],
		ephemeral,
	});
}
