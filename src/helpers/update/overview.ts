import { container } from '@sapphire/framework';
import { DiscordAPIError, type APIEmbed } from 'discord.js';
import { editMessage, sendMessage } from '../../lib/discord/message';
import { fromDiscordAPIError } from '../../lib/utils/ErrorLogger';
import { generateBirthdayEmbed } from '../generate/birthdayList';
import {
	isChannelInvalidError,
	isEmptyMessageError,
	isMessageNotFoundError,
	isRateLimitError,
	requiresConfigReset,
} from '../utils/discord-errors';
import { isEmbedValid } from '../utils/embed';

interface EmbedOptions {
	embeds: [APIEmbed];
}

interface MessageContext {
	guildId: string;
	guildName?: string;
	channelId: string;
	channelName?: string;
	messageId?: string;
}

/**
 * Reset the overview channel configuration
 */
async function resetConfig(guild_id: string, reason: string): Promise<void> {
	try {
		await Promise.all([
			container.utilities.guild.reset.OverviewChannel(guild_id),
			container.utilities.guild.reset.OverviewMessage(guild_id),
		]);
		container.logger.debug(`[Overview] Reset config for guild ${guild_id}: ${reason}`);
	} catch (error) {
		container.errorLogger.handle(error, {
			logSeverity: 'warn',
			taskName: 'updateBirthdayOverview',
			guildId: guild_id,
		});
	}
}

/**
 * Handle Discord API errors with appropriate recovery strategies
 */
async function handleDiscordError(
	error: DiscordAPIError,
	context: MessageContext,
	options: EmbedOptions,
): Promise<void> {
	const { guildId, channelId } = context;

	// Transient errors - log and skip
	if (isRateLimitError(error)) {
		const discordError = fromDiscordAPIError(error, { guildId });
		container.errorLogger.handle(discordError, {
			logSeverity: 'warn',
			taskName: 'updateBirthdayOverview',
			guildId,
		});
		return;
	}

	// Message not found - recreate it
	if (isMessageNotFoundError(error)) {
		container.logger.debug(`[Overview] Message not found for guild ${guildId}, recreating`);
		await createOverviewMessage(channelId, options, context);
		return;
	}

	// Configuration issues - reset config
	if (requiresConfigReset(error)) {
		const reason = isChannelInvalidError(error) ? 'Channel no longer exists' : 'Missing permissions';
		await resetConfig(guildId, reason);
		return;
	}

	// Log other errors with context
	const discordError = fromDiscordAPIError(error, { guildId, channelId });
	container.errorLogger.handle(discordError, {
		logSeverity: 'warn',
		taskName: 'updateBirthdayOverview',
		guildId,
	});

	if (isEmptyMessageError(error)) {
		container.logger.debug(`[Overview] Empty embed detected for guild ${guildId}`);
	}
}

/**
 * Update an existing overview message
 */
async function updateMessage(messageId: string, options: EmbedOptions, context: MessageContext): Promise<void> {
	const { channelId, guildId } = context;

	try {
		await editMessage(channelId, messageId, options);
	} catch (error: unknown) {
		if (error instanceof DiscordAPIError) {
			await handleDiscordError(error, { ...context, messageId }, options);
		} else {
			container.errorLogger.handle(error, {
				logSeverity: 'warn',
				taskName: 'updateBirthdayOverview',
				guildId,
			});
		}
	}
}

/**
 * Create a new overview message and save its ID
 */
async function createOverviewMessage(
	channelId: string,
	options: EmbedOptions,
	context: Omit<MessageContext, 'channelId' | 'messageId'>,
): Promise<void> {
	const { guildId } = context;

	try {
		const message = await sendMessage(channelId, options);
		if (!message?.inGuild()) return;

		await container.utilities.guild.set.OverviewMessage(message.guildId, message.id);
	} catch (error: unknown) {
		if (error instanceof DiscordAPIError) {
			await handleDiscordError(error, { ...context, guildId, channelId }, options);
		} else {
			container.errorLogger.handle(error, {
				logSeverity: 'warn',
				taskName: 'updateBirthdayOverview',
				guildId,
			});
		}
	}
}

/**
 * Main function to update or create the birthday overview message
 */
export default async function updateBirthdayOverview(guildId: string): Promise<void> {
	// Early exit if no overview channel configured
	const config = await container.utilities.guild.get.GuildConfig(guildId);
	if (!config?.overviewChannel) return;

	const { overviewChannel, overviewMessage } = config;

	// Parallel fetch for performance
	const [guild, channel] = await Promise.all([
		container.client.guilds.fetch(guildId).catch(() => null),
		container.client.channels.fetch(overviewChannel).catch(() => null),
	]);

	// Validate guild exists
	if (!guild) {
		container.logger.warn(`[Overview] Guild not found: ${guildId}`);
		return;
	}

	// Validate channel exists and is text-based
	if (!channel?.isTextBased()) {
		container.logger.warn(`[Overview] Invalid channel for guild ${guildId}, resetting config`);
		await resetConfig(guildId, 'Channel is invalid or not text-based');
		return;
	}

	const guildName = guild.name;
	const channelName = 'name' in channel ? channel.name : undefined;

	// Generate birthday embed
	const birthdayEmbed = await generateBirthdayEmbed(guild);

	// Validate embed before sending
	if (!isEmbedValid(birthdayEmbed)) {
		container.logger.debug(`[Overview] Empty embed for guild ${guildId}, skipping`);
		return;
	}

	const options: EmbedOptions = { embeds: [birthdayEmbed] };
	const context: MessageContext = { guildId, guildName, channelId: overviewChannel, channelName };

	// Update or create message
	if (overviewMessage) {
		await updateMessage(overviewMessage, options, context);
	} else {
		await createOverviewMessage(overviewChannel, options, { guildId, guildName, channelName });
	}
}
