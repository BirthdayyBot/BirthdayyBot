import { sendMessage } from '../../lib/discord/message';
import generateEmbed from '../generate/embed';
import { ALARM, BOT_SERVER_LOG } from '../provide/environment';
import getGuildCount from '../provide/guildCount';

export default async function leaveServerLog(guild_id: string) {
	console.log('Removed from Guild');
	const guildID = guild_id;

	const server_count = getGuildCount();

	const obj = {
		title: `${ALARM} ${process.env.BOT_NAME} got removed from a Guild`,
		description: `I am now in \`${server_count}\` guilds`,
		fields: [
			{
				name: `GuildID`,
				value: `${guildID}`
			}
		]
	};

	let embed = await generateEmbed(obj);

	await sendMessage(BOT_SERVER_LOG, { embeds: [embed] });

	return;
}
