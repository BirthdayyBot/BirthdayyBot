import { BOOK, BOT_NAME, SUPPORT, LINK, PLUS, SIGN, ARROW_RIGHT } from '../../helpers/provide/environment';

export const HelpEmbed = {
	title: `${BOOK} ${BOT_NAME} Help`,
	description: `
  ${SUPPORT} Confused what each command does?
  ${LINK} Check out our docs: [https://docs.birthdayy.xyz](https://docs.birthdayy.xyz/commands)
  ${PLUS} Unlock Beta / Premium Features: [Birthdayy Patreon](https://birthdayy.xyz/premium)\n
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
  ${ARROW_RIGHT}/support
  ${ARROW_RIGHT}/feedback
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
  ${ARROW_RIGHT}announcement \`<channel>\`
  ${ARROW_RIGHT}overview \`<channel>\`
  ${ARROW_RIGHT}birthday-role \`<role>\`
  ${ARROW_RIGHT}ping-role \`<role>\`
  ${ARROW_RIGHT}timezone\`<zone>\`
  ${ARROW_RIGHT}announcement-message\`<message>\` ${PLUS}
  ${ARROW_RIGHT}logs \`<channel>\`
      `,
			inline: true
		}
	]
};
