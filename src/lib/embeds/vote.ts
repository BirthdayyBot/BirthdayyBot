import { Emojis, PREMIUM_URL } from '#utils/environment';
import type { APIEmbed } from 'discord.js';

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
	title: `${Emojis.Heart} Support Birthdayy`,
	description: '',
	fields: [
		{
			name: 'Vote for Birthdayy',
			value: `
            ${Emojis.ArrowRight} [top.gg](https://birthdayy.xyz/topgg/vote)
            ${Emojis.ArrowRight} [discord-botlist.eu](https://birthdayy.xyz/discord-botlist/vote)
            ${Emojis.ArrowRight} [discordlist.gg](https://birthdayy.xyz/discordlist/vote)
            `,
			inline: false,
		},
		{
			name: 'Birthdayy Premium',
			value: `${Emojis.ArrowRight} Support the Project and get access to beta features\n${Emojis.Plus} [Birthdayy Patreon](${PREMIUM_URL})`,
			inline: false,
		},
	],
};
