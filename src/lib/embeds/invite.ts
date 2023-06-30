import type { APIEmbed } from 'discord-api-types/v9';
import { ARROW_RIGHT, BOOK, BOT_AVATAR, BOT_NAME } from '../../helpers/provide/environment';
import { BIRTHDAYY_CUPCAKE } from '../components/images';
import { isNotCustom } from '../utils/env';

const BotName = isNotCustom ? BOT_NAME : 'Birthdayy';
export const InviteEmbed: APIEmbed = {
	title: `${BOOK} Invite ${BotName}`,
	description: `${ARROW_RIGHT} Click on the Button below, to invite ${BotName} to your Discord Server!`,
	thumbnail: { url: isNotCustom ? BIRTHDAYY_CUPCAKE : BOT_AVATAR },
};
