import { BOOK, BOT_NAME, SUPPORT, LINK, PLUS, SIGN, ARROW_RIGHT, PREMIUM_URL, DOCS_URL } from '../../helpers/provide/environment';

export const HelpEmbed = {
	title: `${BOOK} ${BOT_NAME} Help`,
	description: `
  ${SUPPORT} Confused what each command does?
  ${LINK} Check out our docs: [https://docs.birthdayy.xyz](${DOCS_URL})
  ${PLUS} Unlock Beta / Premium Features: [Birthdayy Patreon](${PREMIUM_URL})\n
  ${SIGN} \`<>\` required
  ${SIGN} \`[]\` optional
    `,
	fields: [
		{
			name: 'Utilities',
			value: `
  ${ARROW_RIGHT}/help \`[command]\`
  ${ARROW_RIGHT}/guide
  ${ARROW_RIGHT}/invite
  ${ARROW_RIGHT}/status
  ${ARROW_RIGHT}/vote
        `,
			inline: true
		},

		{
			name: '/birthday',
			value: `
  ${ARROW_RIGHT}register \`<day>\` \`<month>\` \`[year]\` \`[user]\`
  ${ARROW_RIGHT}list 
  ${ARROW_RIGHT}update \`<user>\` \`<day>\` \`<month>\` \`[year]\`
  ${ARROW_RIGHT}remove \`<user>\`
  ${ARROW_RIGHT}show \`[user]\`
      `,
			inline: true
		},
		{
			name: '/config',
			value: `
  ${ARROW_RIGHT}status
  ${ARROW_RIGHT}announcement-channel \`<channel>\`
  ${ARROW_RIGHT}overview-channel \`<channel>\`
  ${ARROW_RIGHT}birthday-role \`<role>\`
  ${ARROW_RIGHT}ping-role \`<role>\`
  ${ARROW_RIGHT}timezone\`<zone>\`
  ${ARROW_RIGHT}announcement-message\`<message>\` ${PLUS}
      `,
			inline: true
		}
	]
};
