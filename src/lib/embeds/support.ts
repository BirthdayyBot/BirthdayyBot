import type { APIEmbed } from 'discord-api-types/v9';
import { ARROW_RIGHT, COMPASS, DISCORD_INVITE, DOCS_URL, LINK } from '../../helpers/provide/environment';

export const SupportEmbed: APIEmbed = {
	title: `${COMPASS} Birthdayy Support`,
	description: `
    ${ARROW_RIGHT} Join my [Support Discord Server](${DISCORD_INVITE})
    ${LINK} Check out the Docs [https://docs.birthdayy.xyz](${DOCS_URL})\n
    `,
};
