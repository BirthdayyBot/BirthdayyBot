import { BirthdayyEmojis, BOT_NAME, DOCS_URL, PREMIUM_URL } from '#lib/utils/environment';
import type { APIEmbed } from 'discord-api-types/v9';

export const HelpEmbed: APIEmbed = {
	title: `${BirthdayyEmojis.Book} ${BOT_NAME} Help`,
	description: `
  ${BirthdayyEmojis.Support} Confused what each command does?
  ${BirthdayyEmojis.Link} Check out our docs: [Birthdayy Docs](${DOCS_URL})
  ${BirthdayyEmojis.Plus} Unlock Beta / Premium Features: [Birthdayy Patreon](${PREMIUM_URL})\n
  ${BirthdayyEmojis.Sign} \`<>\` required
  ${BirthdayyEmojis.Sign} \`[]\` optional
    `,
	fields: [
		{
			name: 'Utilities',
			value: `
  ${BirthdayyEmojis.ArrowRight}/help \`[command]\`
  ${BirthdayyEmojis.ArrowRight}/guide
  ${BirthdayyEmojis.ArrowRight}/invite
  ${BirthdayyEmojis.ArrowRight}/status
  ${BirthdayyEmojis.ArrowRight}/vote
        `,
			inline: true,
		},

		{
			name: '/birthday',
			value: `
  ${BirthdayyEmojis.ArrowRight}register \`<day>\` \`<month>\` \`[year]\` \`[user]\`
  ${BirthdayyEmojis.ArrowRight}list
  ${BirthdayyEmojis.ArrowRight}update \`<user>\` \`<day>\` \`<month>\` \`[year]\`
  ${BirthdayyEmojis.ArrowRight}remove \`<user>\`
  ${BirthdayyEmojis.ArrowRight}show \`[user]\`
      `,
			inline: true,
		},
		{
			name: '/config',
			value: `
  ${BirthdayyEmojis.ArrowRight}status
  ${BirthdayyEmojis.ArrowRight}announcement-channel \`<channel>\`
  ${BirthdayyEmojis.ArrowRight}overview-channel \`<channel>\`
  ${BirthdayyEmojis.ArrowRight}birthday-role \`<role>\`
  ${BirthdayyEmojis.ArrowRight}ping-role \`<role>\`
  ${BirthdayyEmojis.ArrowRight}timezone\`<zone>\`
  ${BirthdayyEmojis.ArrowRight}announcement-message\`<message>\` ${BirthdayyEmojis.Plus}
      `,
			inline: true,
		},
	],
};
