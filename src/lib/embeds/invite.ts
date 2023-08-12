import { BIRTHDAYY_CUPCAKE } from '#lib/components/images';
import { isNotCustom } from '#utils/env';
import { BOT_AVATAR, BOT_NAME, Emojis } from '#utils/environment';
import type { APIEmbed } from 'discord-api-types/v9';

const BotName = isNotCustom ? BOT_NAME : 'Birthdayy';
export const InviteEmbed: APIEmbed = {
	title: `${Emojis.Book} Invite ${BotName}`,
	description: `${Emojis.ArrowRight} Click on the Button below, to invite ${BotName} to your Discord Server!`,
	thumbnail: { url: isNotCustom ? BIRTHDAYY_CUPCAKE : BOT_AVATAR },
};
