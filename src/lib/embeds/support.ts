import { COMPASS, ARROW_RIGHT, DISCORD_INVITE, LINK, DOCS_URL } from '#root/helpers/provide/environment';
import type { APIEmbed } from 'discord-api-types/v9';

export const SupportEmbed: APIEmbed = {
	title: `${COMPASS} Birthdayy Support`,
	description: `
    ${ARROW_RIGHT} Join my [Support Discord Server](${DISCORD_INVITE})
    ${LINK} Check out the Docs [https://docs.birthdayy.xyz](${DOCS_URL})\n
    `
};
