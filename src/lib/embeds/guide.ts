import type { APIEmbed } from 'discord-api-types/v9';
import { BOT_INVITE, BOT_NAME, BirthdayyEmojis, DISCORD_INVITE, PREMIUM_URL } from '../../helpers/provide/environment';

export const GuideEmbed: APIEmbed = {
	title: `${BirthdayyEmojis.Heart} ${BOT_NAME} Guide!`,
	description: `
    ${BirthdayyEmojis.ArrowRight} By typing **/help** in chat, you can check out all my features and available commands.
    `,
	fields: [
		{
			name: 'Get Started',
			value: `
${BirthdayyEmojis.Exclamation} Register your Birthday with **/birthday register** \`<day> <month> [year]\`\n${BirthdayyEmojis.ArrowRight} Find more on [docs.birthdayy.xyz/quickstart](https://docs.birthdayy.xyz/quickstart)
    `,
		},
		{
			name: 'Configure Birthdayy',
			value: `
${BirthdayyEmojis.Exclamation} Make sure to set your **Serverconfigurations** with **/config <config>**!\n${BirthdayyEmojis.ArrowRight} Use **/config status** to see your current config setting.
    `,
		},
		{
			name: 'Important',
			value: `
${BirthdayyEmojis.Exclamation} My **highest** Role needs to be **above** the birthday child role.\n${BirthdayyEmojis.ArrowRight} Join the [Birthdayy HQ](${DISCORD_INVITE}) to meet the Developer and help improving Birthdayy ${BirthdayyEmojis.Cake}
${BirthdayyEmojis.Heart} Like **Birthdayy**? Consider [inviting](${BOT_INVITE}) and [voting](https://docs.birthdayy.xyz/extras/links/vote) for me!\n${BirthdayyEmojis.Plus} Want access to beta features? [Support us on Patreon](${PREMIUM_URL})
    `,
		},
	],
};
