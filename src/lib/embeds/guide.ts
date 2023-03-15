import { HEART, ARROW_RIGHT, EXCLAMATION, DISCORD_INVITE, CAKE, PLUS, PREMIUM_URL, BOT_NAME, BOT_INVITE } from '../../helpers/provide/environment';

export const GuideEmbed = {
	title: `${HEART} ${BOT_NAME} Guide!`,
	description: `
    ${ARROW_RIGHT} By typing **/help** in chat, you can check out all my features and available commands.
    `,
	fields: [
		{
			name: 'Get Started',
			value: `
${EXCLAMATION} Register your Birthday with **/birthday register** \`<day> <month> [year]\`\n${ARROW_RIGHT} Find more on [docs.birthdayy.xyz/quickstart](https://docs.birthdayy.xyz/quickstart)
    `,
		},
		{
			name: 'Configure Birthdayy',
			value: `
${EXCLAMATION} Make sure to set your **Serverconfigurations** with **/config <config>**!\n${ARROW_RIGHT} Use **/config status** to see your current config setting.
    `,
		},
		{
			name: 'Important',
			value: `
${EXCLAMATION} My **highest** Role needs to be **above** the birthday child role.\n${ARROW_RIGHT} Join the [Birthdayy HQ](${DISCORD_INVITE}) to meet the Developer and help improving Birthdayy ${CAKE}
${HEART} Like **Birthdayy**? Consider [inviting](${BOT_INVITE}) and [voting](https://docs.birthdayy.xyz/extras/links/vote) for me!\n${PLUS} Want access to beta features? [Support us on Patreon](${PREMIUM_URL})
    `,
		},
	],
};
