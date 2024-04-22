import { Emojis } from '#lib/utils/constants';
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
            ${Emojis.Arrow} [top.gg](https://birthdayy.xyz/topgg/vote)
            ${Emojis.Arrow} [discord-botlist.eu](https://birthdayy.xyz/discord-botlist/vote)
            ${Emojis.Arrow} [discordlist.gg](https://birthdayy.xyz/discordlist/vote)
            `,
			inline: false
		},
		{
			name: 'Birthdayy Premium',
			value: `${Emojis.Arrow} Support the Project and get access to beta features\n${Emojis.Plus} [Birthdayy Patreon](https://www.patreon.com/birthdayy)`,
			inline: false
		}
	]
};
