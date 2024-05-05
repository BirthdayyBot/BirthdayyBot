import { Emojis } from '#utils/constants';
import type { APIEmbed } from 'discord.js';

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
			inline: false
		},
		{
			name: 'Birthdayy Premium',
			value: `${Emojis.ArrowRight} Support the Project and get access to beta features\n${Emojis.Plus} [Birthdayy Patreon](https://www.patreon.com/birthdayy)`,
			inline: false
		}
	]
};
