import { ARROW_RIGHT, BOOK, BOT_AVATAR, BOT_NAME } from '../../helpers/provide/environment';
import type { EmbedInformationModel } from '../model/EmbedInformation.model';

export const InviteEmbed: EmbedInformationModel = {
	title: `${BOOK} Invite ${BOT_NAME}`,
	description: `${ARROW_RIGHT} Click on the Button below, to invite ${BOT_NAME} to your Discord Server!`,
	thumbnail_url: BOT_AVATAR
};
