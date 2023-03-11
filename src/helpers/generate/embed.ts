import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import { BOT_AVATAR, BOT_COLOR, BOT_NAME, IS_CUSTOM_BOT } from '../provide/environment';

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
 * @returns embed - A RichEmbed object with the given information
 */

export default async function generateEmbed(embed_information: EmbedInformationModel): Promise<Object> {
    const { title, description, author_name, author_avatar, thumbnail_url, image_url, fields, color } = embed_information;

    const currentDate = new Date();
    const timestamp = currentDate.toISOString();

    const embedColor: number = !color ? BOT_COLOR : parseInt(color as string);

    const author = !author_name && !author_avatar ? {} : { name: author_name, icon_url: author_avatar };
    const footer = { text: `${BOT_NAME} ${IS_CUSTOM_BOT ? '👑' : ''}`, icon_url: BOT_AVATAR };
    const thumbnail = !thumbnail_url ? {} : { url: thumbnail_url };
    const image = !image_url ? {} : { url: image_url };
    const embedFields = !fields ? [] : fields;

    const embed = {
        title: title,
        color: embedColor,
        description: description,
        timestamp: timestamp,
        author: author,
        footer: footer,
        fields: embedFields,
        thumbnail: thumbnail,
        image: image,
    };
    return embed;
}
