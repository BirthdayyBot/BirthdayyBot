import type { APIEmbed } from 'discord-api-types/v9';
import { ARROW_RIGHT, HEART, PLUS, PREMIUM_URL } from '../../helpers/provide/environment';

// ! Currently not working??
/*
import { VoteSites } from '../db/voteSites';
 const VoteFields = (): string => {
	const sites = VoteSites;
	let value = '';
	sites.map((site) => {
		value += `${ARROW_RIGHT}[${site.name}](${site.url})\n`;
	});
	container.logger.info('value', value);
	return value;
}; */

export const VoteEmbed: APIEmbed = {
	title: `${HEART} Support Birthdayy`,
	description: '',
	fields: [
		{
			name: 'Vote for Birthdayy',
			value: `
            ${ARROW_RIGHT} [top.gg](https://birthdayy.xyz/topgg/vote)
            ${ARROW_RIGHT} [discord-botlist.eu](https://birthdayy.xyz/discord-botlist/vote)
            ${ARROW_RIGHT} [discordlist.gg](https://birthdayy.xyz/discordlist/vote)
            `,
			inline: false,
		},
		{
			name: 'Birthdayy Premium',
			value: `${ARROW_RIGHT} Support the Project and get access to beta features\n${PLUS} [Birthdayy Patreon](${PREMIUM_URL})`,
			inline: false,
		},
	],
};
