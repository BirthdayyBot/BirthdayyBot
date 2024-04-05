import { WebsiteUrl } from '#lib/components/button';
import { Emojis } from '#lib/utils/constants';
import { CLIENT_NAME } from '#utils/environment';
import type { APIEmbed } from 'discord-api-types/v9';

export const HelpEmbed: APIEmbed = {
	title: `${Emojis.Book} ${CLIENT_NAME} Help`,
	description: `
  ${Emojis.Support} Confused what each command does?
  ${Emojis.Link} Check out our docs: [Birthdayy Docs](${WebsiteUrl('docs')})
  ${Emojis.Plus} Unlock Beta / Premium Features: [Birthdayy Patreon](${WebsiteUrl('premium')})\n
  ${Emojis.Sign} \`<>\` required
  ${Emojis.Sign} \`[]\` optional
    `,
	fields: [
		{
			name: 'Utilities',
			value: `
  ${Emojis.Arrow}/help \`[command]\`
  ${Emojis.Arrow}/guide
  ${Emojis.Arrow}/invite
  ${Emojis.Arrow}/status
  ${Emojis.Arrow}/vote
        `,
			inline: true,
		},

		{
			name: '/birthday',
			value: `
  ${Emojis.Arrow}set \`<day>\` \`<month>\` \`[year]\` \`[user]\`
  ${Emojis.Arrow}list
  ${Emojis.Arrow}update \`<user>\` \`<day>\` \`<month>\` \`[year]\`
  ${Emojis.Arrow}remove \`<user>\`
  ${Emojis.Arrow}show \`[user]\`
      `,
			inline: true,
		},
		{
			name: '/config',
			value: `
  ${Emojis.Arrow}status
  ${Emojis.Arrow}announcement-channel \`<channel>\`
  ${Emojis.Arrow}overview-channel \`<channel>\`
  ${Emojis.Arrow}birthday-role \`<role>\`
  ${Emojis.Arrow}ping-role \`<role>\`
  ${Emojis.Arrow}timezone\`<zone>\`
  ${Emojis.Arrow}announcement-message\`<message>\` ${Emojis.Plus}
      `,
			inline: true,
		},
	],
};
