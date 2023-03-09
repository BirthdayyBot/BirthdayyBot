import generateBirthdayList from '../generate/birthdayList';
import generateEmbed from '../generate/embed';
import { getConfig, logAll, setOVERVIEW_MESSAGE } from '../provide/config';
import { getTextChannel } from '../../lib/discord/channel';
import { editMessage } from '../../lib/discord/message';
import { container } from '@sapphire/framework';

export default async function updateBirthdayOverview(guild_id: string) {
    const config = await getConfig(guild_id);
    logAll(config);
    const { OVERVIEW_CHANNEL, OVERVIEW_MESSAGE } = config;

    /**
    Check if there is a overview channel set.
  if yes -> check if messageID is set
  if yes -> update message
  if no -> create a new message and save as messageID
   */

    if (OVERVIEW_CHANNEL) {
        const birthdayList = await generateBirthdayList(1, guild_id);
        const birthdayEmbedObj = await generateEmbed(birthdayList.embed);
        try {
            if (OVERVIEW_MESSAGE) {
                try {
                    await editMessage(OVERVIEW_CHANNEL, OVERVIEW_MESSAGE, { embeds: [birthdayEmbedObj], components: birthdayList.components });
                } catch (error: any) {
                    if (
                        error.message === 'Unknown Message' ||
						error.message.includes('authored by another user') ||
						error.message.includes('Message not found')
                    ) {
                        await generateNewOverviewMessage(OVERVIEW_CHANNEL, birthdayList);
                        console.error('Message Not found, so generated new overview message');
                    }
                }
                container.logger.info(`Updated Overview Message in guild: ${guild_id}`);
            } else if (!OVERVIEW_MESSAGE) {
                await generateNewOverviewMessage(OVERVIEW_CHANNEL, birthdayList);
            }
        } catch (error) {}
    }
}

async function generateNewOverviewMessage(channel_id: string, birthdayList: { embed: any; components: any[] }) {
    // send a new overview message to the overview channel
    const channel = await getTextChannel(channel_id);
    const message = await channel.send({ embeds: [birthdayList.embed], components: birthdayList.components });
    // container.logger.info('message', message);
    await setOVERVIEW_MESSAGE(message.id, message.guildId!);
}
