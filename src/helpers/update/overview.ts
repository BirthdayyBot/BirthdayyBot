import generateBirthdayList from '../generate/birthdayList';
import generateEmbed from '../generate/embed';
import { getConfig, logAll, setOVERVIEW_MESSAGE } from '../provide/config';
import { getTextChannel } from '../../lib/discord/channel';
import { editMessage } from '../../lib/discord/message';

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
				try {
					await editMessage(OVERVIEW_CHANNEL, OVERVIEW_MESSAGE, { embeds: [birthdayEmbedObj], components: birthdayList.components });
				} catch (error: any) {
					console.log('error', error);

					if (error.message === 'Unknown Message') {
						generateNewOverviewMessage(OVERVIEW_CHANNEL, birthdayList);
					}
				}
				console.log(`Updated Overview Message in guild: ${guild_id}`);
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
	await setOVERVIEW_MESSAGE(message.id, message.guildId!);
}
