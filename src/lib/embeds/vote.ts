import type { APIEmbed } from 'discord-api-types/v9';
import { BirthdayyEmojis, PREMIUM_URL } from '../../helpers/provide/environment';

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
	title: `${BirthdayyEmojis.Heart} Support Birthdayy`,
	description: '',
	fields: [
		{
			name: 'Vote for Birthdayy',
			value: `
            ${BirthdayyEmojis.ArrowRight} [top.gg](https://birthdayy.xyz/topgg/vote)
            ${BirthdayyEmojis.ArrowRight} [discord-botlist.eu](https://birthdayy.xyz/discord-botlist/vote)
            ${BirthdayyEmojis.ArrowRight} [discordlist.gg](https://birthdayy.xyz/discordlist/vote)
            `,
			inline: false,
		},
		{
			name: 'Birthdayy Premium',
			value: `${BirthdayyEmojis.ArrowRight} Support the Project and get access to beta features\n${BirthdayyEmojis.Plus} [Birthdayy Patreon](${PREMIUM_URL})`,
			inline: false,
		},
	],
};
