import generateBirthdayList from '../generate/birthdayList';
import generateEmbed from '../generate/embed';
import { getConfig, logAll } from '../provide/config';
import { ENV, TEST_OVERVIEW_MESSAGE } from '../provide/environment';
import fetchMessage from '../../lib/discord/message';
import getTextChannel from '../../lib/discord/channel';

export default async function updateBirthdayOverview(guild_id: string) {
	const config = await getConfig(guild_id);
	logAll(config);
	let { OVERVIEW_CHANNEL, OVERVIEW_MESSAGE } = config;

	/**
    Check if there is a overview channel set.
  if yes -> check if messageID is set
  if yes -> update message
  if no -> create a new message and save as messageID
   */

	if (OVERVIEW_CHANNEL) {
		const birthdayList = await generateBirthdayList(1, guild_id);
		const birthdayEmbedObj = generateEmbed(birthdayList.embed);
		try {
			if (OVERVIEW_MESSAGE) {
				OVERVIEW_MESSAGE = ENV === 'dev' ? TEST_OVERVIEW_MESSAGE : OVERVIEW_MESSAGE;
				const message = await fetchMessage(OVERVIEW_CHANNEL, OVERVIEW_MESSAGE);
				await message.edit({ embeds: [birthdayEmbedObj], components: birthdayList.components });
				console.log(`Updated Overview Message in guild: ${guild_id}`);
				// await lib.discord.channels['@0.0.1'].messages.update({
				// 	channel_id: OVERVIEW_CHANNEL,
				// 	message_id: OVERVIEW_MESSAGE,
				// 	embed: birthdayEmbedObj
				// });
			} else if (!OVERVIEW_MESSAGE) {
				generateNewOverviewMessage(OVERVIEW_CHANNEL, birthdayList);
			}
		} catch (error) {}
	}
}

async function generateNewOverviewMessage(channel_id: string, birthdayList: { embed: any; components: any[] }) {
	//send a new overview message to the overview channel
	const channel = await getTextChannel(channel_id);
	const message = await channel.send({ embeds: [birthdayList.embed], components: birthdayList.components });
	console.log('message', message);
	//TODO: Set the messageID in the database
}
