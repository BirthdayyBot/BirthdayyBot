import type { APIEmbed } from 'discord-api-types/v9';
import { BirthdayyEmojis, DISCORD_INVITE, DOCS_URL } from '../../helpers/provide/environment';

export const SupportEmbed: APIEmbed = {
	title: `${BirthdayyEmojis.Compass} Birthdayy Support`,
	description: `
    ${BirthdayyEmojis.ArrowRight} Join my [Support Discord Server](${DISCORD_INVITE})
    ${BirthdayyEmojis.Link} Check out the Docs [https://docs.birthdayy.xyz](${DOCS_URL})\n
    `,
};
