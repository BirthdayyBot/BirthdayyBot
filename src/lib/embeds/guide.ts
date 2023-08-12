import { BOT_INVITE, BOT_NAME, Emojis, DISCORD_INVITE, PREMIUM_URL } from '#utils/environment';
import type { APIEmbed } from 'discord-api-types/v9';

export const GuideEmbed: APIEmbed = {
	title: `${Emojis.Heart} ${BOT_NAME} Guide!`,
	description: `
    ${Emojis.ArrowRight} By typing **/help** in chat, you can check out all my features and available commands.
    `,
	fields: [
		{
			name: 'Get Started',
			value: `
${Emojis.Exclamation} Register your Birthday with **/birthday register** \`<day> <month> [year]\`\n${Emojis.ArrowRight} Find more on [docs.birthdayy.xyz/quickstart](https://docs.birthdayy.xyz/quickstart)
    `,
		},
		{
			name: 'Configure Birthdayy',
			value: `
${Emojis.Exclamation} Make sure to set your **Serverconfigurations** with **/config <config>**!\n${Emojis.ArrowRight} Use **/config status** to see your current config setting.
    `,
		},
		{
			name: 'Important',
			value: `
${Emojis.Exclamation} My **highest** Role needs to be **above** the birthday child role.\n${Emojis.ArrowRight} Join the [Birthdayy HQ](${DISCORD_INVITE}) to meet the Developer and help improving Birthdayy ${Emojis.Cake}
${Emojis.Heart} Like **Birthdayy**? Consider [inviting](${BOT_INVITE}) and [voting](https://docs.birthdayy.xyz/extras/links/vote) for me!\n${Emojis.Plus} Want access to beta features? [Support us on Patreon](${PREMIUM_URL})
    `,
		},
	],
};
