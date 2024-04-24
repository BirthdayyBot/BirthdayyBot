import { isDMChannel, isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { Result, container } from '@sapphire/framework';
import { Guild, GuildTextBasedChannel, type MessageCreateOptions, MessagePayload } from 'discord.js';

import { generateBirthdayList } from './birthday.js';

export async function updateBirthdayOverview(guild: Guild) {
	const settings = await container.prisma.guild.findUniqueOrThrow({ where: { id: guild.id } });
	if (!settings) return container.logger.error(`Failed to fetch guild settings in guild: ${guild.id}`);

	const { channelsOverview, messagesOverview } = settings;
	if (!channelsOverview) return container.logger.error(`Failed to fetch Overview channel in guild: ${guild.id}`);

	const channel = await container.client.channels.fetch(channelsOverview).catch(() => null);

	if (!channel) return container.logger.error(`Failed to fetch channel in guild: ${guild.id}`);

	if (isDMChannel(channel)) return container.logger.error(`Channel is a DM Channel in guild: ${guild.id}`);

	if (!isGuildBasedChannel(channel)) return container.logger.error(`Channel is not a Guild Based Channel in guild: ${guild.id}`);

	const { components, embed } = await generateBirthdayList(1, guild);

	const message = messagesOverview
		? await channel.messages.fetch(messagesOverview).catch(() => null)
		: await createOverviewMessage(channel, { content: 'Loading ...' });

	if (!message) return container.logger.error(`Failed to fetch or create message in guild: ${guild.id}`);

	return message.edit({ components, content: null, embeds: [embed] });
}

async function createOverviewMessage(channel: GuildTextBasedChannel, options: MessageCreateOptions | MessagePayload) {
	const result = await Result.fromAsync(channel.send(options));

	return result.match({
		err: (error) => {
			container.logger.error(`Failed to send message in channel: ${channel.id} with error: ${error}`);
			return null;
		},
		ok: async (message) => {
			await container.prisma.guild.update({
				data: { messagesOverview: message.id },
				where: { id: channel.guildId }
			});

			return message;
		}
	});
}
