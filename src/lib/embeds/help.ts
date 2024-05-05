import { WebsiteUrl } from '#lib/components/button';
import { Emojis } from '#utils/constants';
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
  ${Emojis.ArrowRight}/help \`[command]\`
  ${Emojis.ArrowRight}/guide
  ${Emojis.ArrowRight}/invite
  ${Emojis.ArrowRight}/status
  ${Emojis.ArrowRight}/vote
        `,
			inline: true
		},

		{
			name: '/birthday',
			value: `
  ${Emojis.ArrowRight}set \`<day>\` \`<month>\` \`[year]\` \`[user]\`
  ${Emojis.ArrowRight}list
  ${Emojis.ArrowRight}update \`<user>\` \`<day>\` \`<month>\` \`[year]\`
  ${Emojis.ArrowRight}remove \`<user>\`
  ${Emojis.ArrowRight}show \`[user]\`
      `,
			inline: true
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
			inline: true
		}
	]
};
