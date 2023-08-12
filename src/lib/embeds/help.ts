import { Emojis, BOT_NAME, DOCS_URL, PREMIUM_URL } from '#utils/environment';
import type { APIEmbed } from 'discord-api-types/v9';

export const HelpEmbed: APIEmbed = {
	title: `${Emojis.Book} ${BOT_NAME} Help`,
	description: `
  ${Emojis.Support} Confused what each command does?
  ${Emojis.Link} Check out our docs: [Birthdayy Docs](${DOCS_URL})
  ${Emojis.Plus} Unlock Beta / Premium Features: [Birthdayy Patreon](${PREMIUM_URL})\n
  ${Emojis.Sign} \`<>\` required
  ${Emojis.Sign} \`[]\` optional
    `,
	fields: [
		{
			name: 'Utilities',
			value: `
  ${Emojis.ArrowRight}/help \`[command]\`
  ${Emojis.ArrowRight}/guide
  ${Emojis.ArrowRight}/invite
  ${Emojis.ArrowRight}/status
  ${Emojis.ArrowRight}/vote
        `,
			inline: true,
		},

		{
			name: '/birthday',
			value: `
  ${Emojis.ArrowRight}register \`<day>\` \`<month>\` \`[year]\` \`[user]\`
  ${Emojis.ArrowRight}list
  ${Emojis.ArrowRight}update \`<user>\` \`<day>\` \`<month>\` \`[year]\`
  ${Emojis.ArrowRight}remove \`<user>\`
  ${Emojis.ArrowRight}show \`[user]\`
      `,
			inline: true,
		},
		{
			name: '/config',
			value: `
  ${Emojis.ArrowRight}status
  ${Emojis.ArrowRight}announcement-channel \`<channel>\`
  ${Emojis.ArrowRight}overview-channel \`<channel>\`
  ${Emojis.ArrowRight}birthday-role \`<role>\`
  ${Emojis.ArrowRight}ping-role \`<role>\`
  ${Emojis.ArrowRight}timezone\`<zone>\`
  ${Emojis.ArrowRight}announcement-message\`<message>\` ${Emojis.Plus}
      `,
			inline: true,
		},
	],
};
