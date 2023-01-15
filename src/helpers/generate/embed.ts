import * as env from '../provide/environment';
import { container } from '@sapphire/framework';

/**
 * Creates a RichEmbed object with the given information
 *
 * @param {object} embed_information
 * @property {string} title - The title of the embed
 * @property {string} description - The description of the embed
 * @property {string} [author_name] - The name of the author of the embed
 * @property {string} [author_avatar] - The avatar of the author of the embed
 * @property {string} [thumbnail_url] - The URL of the thumbnail to include in the embed
 * @property {string} [image_url] - The URL of the image to include in the embed
 * @property {Array<Object>} [fields] - An array of fields to include in the embed
 * @property {string} [color] - The color of the embed
 *
 * @returns {Promise<object>} embed - A RichEmbed object with the given information
 */

export default async function generateEmbed(embed_information: {
	title?: string;
	description?: string;
	author_name?: string;
	author_avatar?: string;
	thumbnail_url?: string;
	image_url?: string;
	fields?: Array<Object>;
	color?: string;
}): Promise<object> {
	container.logger.info('log message');
	const { title, description, author_name, author_avatar, thumbnail_url, image_url, fields, color } = embed_information;

	const currentDate = new Date();
	const timestamp = currentDate.toISOString();

	const embedColor = !color ? env.BOT_COLOR : parseInt(color);

	const author = !author_name && !author_avatar ? {} : { name: author_name, icon_url: author_avatar };
	const footer = { text: `${env.BOT_NAME} ${env.ENV === 'premium' ? '👑' : ''}`, icon_url: env.BOT_AVATAR };
	const thumbnail = !thumbnail_url ? {} : { url: thumbnail_url };
	const image = !image_url ? {} : { url: image_url };

	const embed = {
		title: title,
		color: embedColor,
		description: description,
		timestamp: timestamp,
		author: author,
		footer: footer,
		fields: fields,
		thumbnail: thumbnail,
		image: image
	};
	return embed;
}
