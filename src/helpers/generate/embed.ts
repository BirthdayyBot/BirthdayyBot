import type { APIEmbed } from 'discord.js';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import { BOT_AVATAR, BOT_COLOR, BOT_NAME, IS_CUSTOM_BOT } from '../provide/environment';

/**
 * Creates a RichEmbed object with the given information
 *
 * @param embed_information - Information to the embed
 *
 * @returns embed - A RichEmbed object with the given information
 */

export default function generateEmbed({
	title, description, author_name, author_avatar,
	thumbnail_url, image_url, fields, color,
}: EmbedInformationModel): APIEmbed {

	return {
		title: title ?? '',
		color: parseInt(color as string) || BOT_COLOR,
		description: description,
		timestamp: new Date().toISOString(),
		author: {
			name: author_name ?? '',
			icon_url: author_avatar ?? '',
		},
		footer: { text: `${BOT_NAME} ${IS_CUSTOM_BOT ? '👑' : ''}`, icon_url: BOT_AVATAR },
		fields: fields,
		thumbnail: {
			url: thumbnail_url ?? '',
		},
		image: {
			url: image_url ?? '',
		},
	};
}
