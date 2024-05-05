import { editMessage, sendMessage } from '#lib/discord';
import { generateBirthdayList } from '#utils/birthday';
import { isPrivateMessage } from '#utils/common';
import { container } from '@sapphire/framework';
import { DiscordAPIError, MessagePayload, type MessageCreateOptions } from 'discord.js';

export async function updateBirthdayOverview(guild_id: string) {
	const config = await container.utilities.guild.get.GuildConfig(guild_id);
	if (!config || !config.overviewChannel) return;
	const { overviewChannel, overviewMessage } = config;
	const guild = await container.client.guilds.fetch(guild_id);

	const birthdayList = await generateBirthdayList(1, guild);

	const options = { ...birthdayList.components, embeds: [birthdayList.embed] };

	if (overviewMessage) {
		try {
			await editMessage(overviewChannel, overviewMessage, options);
		} catch (error: any) {
			if (error instanceof DiscordAPIError) {
				if (
					error.message === 'Unknown Message' ||
					error.message.includes('authored by another user') ||
					error.message.includes('Message not found')
				) {
					await generateNewOverviewMessage(overviewChannel, options);
					container.logger.warn('Message Not found, so generated new overview message');
				} else if (error.message.includes('Missing Permissions')) {
					await container.utilities.guild.reset.OverviewChannel(guild_id);
					await container.utilities.guild.reset.OverviewMessage(guild_id);
					container.logger.warn('Overview Channel was missing permissions, so reset it');
				} else {
					container.logger.error('[OVERVIEW CHANNEL 1] ', error.message);
					if (error.message.includes('empty message')) {
						container.logger.error('updateBirthdayOverview ~ birthdayEmbedObj:', options.embeds?.[0]);
					}
				}
			}
		}
		container.logger.info(`Updated Overview Message in guild: ${guild_id}`);
		return;
	}
	if (!overviewMessage) {
		await generateNewOverviewMessage(overviewChannel, options).catch((error: any) => {
			if (error instanceof DiscordAPIError) {
				container.logger.error('[OVERVIEW CHANNEL 2] ', error.message);
				if (error.message.includes('empty message')) {
					container.logger.error('updateBirthdayOverview ~ birthdayEmbedObj:', options.embeds?.[0]);
				}
			}
		});
	}
}

async function generateNewOverviewMessage(channel_id: string, birthdayList: MessageCreateOptions | MessagePayload) {
	const message = await sendMessage(channel_id, birthdayList);
	if (!message || isPrivateMessage(message)) return;
	await container.utilities.guild.set.OverviewMessage(message.guildId, message.id);
}
