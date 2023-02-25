import generateEmbed from '../generate/embed';
import { ALARM, AUTOCODE_ENV, BOT_ID, BOT_SERVER_LOG } from '../provide/environment';

const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

export default async function leaveServerLog(guild_id: string) {
	console.log('Removed from Guild');
	const guildID = guild_id;

	let server_count = await lib.meiraba.utils['@1.0.1'].discord.bot_server_count({
		bot_id: `${BOT_ID}`
	});

	try {
		let guild = await lib.discord.guilds['@0.2.4'].retrieve({
			guild_id: `${guild_id}`,
			with_counts: false
		});
		console.log(guild);
	} catch (e) {
		console.log('couldnt retrieve infos about left guild :C');
	}
	let obj = {
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

	await lib.discord.channels[AUTOCODE_ENV].messages.create({
		channel_id: BOT_SERVER_LOG,
		content: '',
		embeds: [embed]
	});

	return;
}
