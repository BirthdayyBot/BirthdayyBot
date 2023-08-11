import { BIRTHDAYY_CUPCAKE } from '#lib/components/images';
import { isNotCustom } from '#lib/utils/env';
import { BOT_AVATAR, BOT_NAME, BirthdayyEmojis } from '#lib/utils/environment';
import type { APIEmbed } from 'discord-api-types/v9';

const BotName = isNotCustom ? BOT_NAME : 'Birthdayy';
export const InviteEmbed: APIEmbed = {
	title: `${BirthdayyEmojis.Book} Invite ${BotName}`,
	description: `${BirthdayyEmojis.ArrowRight} Click on the Button below, to invite ${BotName} to your Discord Server!`,
	thumbnail: { url: isNotCustom ? BIRTHDAYY_CUPCAKE : BOT_AVATAR },
};
