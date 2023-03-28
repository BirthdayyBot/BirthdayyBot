import { container } from '@sapphire/framework';
import type { MessageCreateOptions } from 'discord.js';
import { editMessage, sendMessage } from '../../lib/discord/message';
import generateBirthdayList from '../generate/birthdayList';
import generateEmbed from '../generate/embed';

export default async function updateBirthdayOverview(guild_id: string) {
	const config = await container.utilities.guild.get.GuildConfig(guild_id);
	if (!config) return;
	const { overview_channel, overview_message } = config;

	/**
    Check if there is a overview channel set.
  if yes -> check if messageID is set
  if yes -> update message
  if no -> create a new message and save as messageID
   */

	if (overview_channel) {
		const birthdayList = await generateBirthdayList(1, guild_id);
		const birthdayEmbedObj = await generateEmbed(birthdayList.embed);
		try {
			if (overview_message) {
				try {
					await editMessage(overview_channel, overview_message, { embeds: [birthdayEmbedObj], components: birthdayList.components });
				} catch (error: any) {
					if (
						error.message === 'Unknown Message' ||
						error.message.includes('authored by another user') ||
						error.message.includes('Message not found')
					) {
						await generateNewOverviewMessage(overview_channel, birthdayList);
						container.logger.error('Message Not found, so generated new overview message');
					}
				}
				container.logger.info(`Updated Overview Message in guild: ${guild_id}`);
			} else if (!overview_message) {
				await generateNewOverviewMessage(overview_channel, birthdayList);
			}
		} catch (error) {
			container.logger.error('[OVERVIEW CHANNEL] ', error);
		}
	}
}

async function generateNewOverviewMessage(channel_id: string, birthdayList: Pick<MessageCreateOptions, 'embeds' | 'components'>) {
	// send a new overview message to the overview channel
	const message = await sendMessage(channel_id, { ...birthdayList });
	if (!message?.inGuild()) return;
	// container.logger.info('message', message);
	await container.utilities.guild.set.OverviewMessage(message.guildId, message.id);
}
