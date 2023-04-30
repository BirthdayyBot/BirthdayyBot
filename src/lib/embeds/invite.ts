import type { APIEmbed } from 'discord-api-types/v9';
import { ARROW_RIGHT, BOOK, BOT_AVATAR, BOT_NAME } from '../../helpers/provide/environment';

export const InviteEmbed: APIEmbed = {
	title: `${BOOK} Invite ${BOT_NAME}`,
	description: `${ARROW_RIGHT} Click on the Button below, to invite ${BOT_NAME} to your Discord Server!`,
	thumbnail: { url: BOT_AVATAR },
};
