import { container } from '@sapphire/framework';
import { DiscordAPIError, type APIEmbed } from 'discord.js';
import { editMessage, sendMessage } from '../../lib/discord/message';
import { generateBirthdayEmbed } from '../generate/birthdayList';
import {
	isChannelInvalidError,
	isEmptyMessageError,
	isMessageNotFoundError,
	isRateLimitError,
	requiresConfigReset,
} from '../utils/discord-errors';
import { isEmbedValid } from '../utils/embed';
import { overviewLogger } from '../utils/overview-logger';

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
	await Promise.all([
		container.utilities.guild.reset.OverviewChannel(guild_id),
		container.utilities.guild.reset.OverviewMessage(guild_id),
	]);
	overviewLogger.warn(`Reset overview configuration: ${reason}`, { guildId: guild_id });
}

/**
 * Handle Discord API errors with appropriate recovery strategies
 */
async function handleDiscordError(
	error: DiscordAPIError,
	context: MessageContext,
	options: EmbedOptions,
): Promise<void> {
	const { guildId, channelId, guildName, channelName } = context;

	// Transient errors - log and skip
	if (isRateLimitError(error)) {
		overviewLogger.warn('Rate limited, will retry later', { guildId, guildName });
		return;
	}

	// Message not found - recreate it
	if (isMessageNotFoundError(error)) {
		overviewLogger.warn('Message not found, creating new one', {
			guildId,
			guildName,
			channelId,
			channelName,
		});
		await createOverviewMessage(channelId, options, context);
		return;
	}

	// Configuration issues - reset config
	if (requiresConfigReset(error)) {
		const reason = isChannelInvalidError(error) ? 'Channel no longer exists' : 'Missing permissions';
		await resetConfig(guildId, reason);
		return;
	}

	// Log other errors with full context
	overviewLogger.error(`Discord API error: ${error.message}`, { guildId, guildName, channelId, channelName }, error);

	if (isEmptyMessageError(error)) {
		overviewLogger.error('Empty embed detected', {
			guildId,
			guildName,
			channelId,
			channelName,
		});
		container.logger.error('Embed content:', options.embeds[0]);
	}
}

/**
 * Update an existing overview message
 */
async function updateMessage(messageId: string, options: EmbedOptions, context: MessageContext): Promise<void> {
	const { guildId, channelId, guildName, channelName } = context;

	try {
		await editMessage(channelId, messageId, options);
		overviewLogger.success('Updated overview message', {
			guildId,
			guildName,
			channelId,
			channelName,
		});
	} catch (error: unknown) {
		if (error instanceof DiscordAPIError) {
			await handleDiscordError(error, { ...context, messageId }, options);
		} else if (error instanceof Error) {
			overviewLogger.error(
				`Unexpected error: ${error.message}`,
				{ guildId, guildName, channelId, channelName },
				error,
			);
		} else {
			overviewLogger.error('Unknown error type', {
				guildId,
				guildName,
				channelId,
				channelName,
			});
			container.logger.error('Error details:', error);
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
	const { guildId, guildName, channelName } = context;

	try {
		const message = await sendMessage(channelId, options);
		if (!message?.inGuild()) return;

		await container.utilities.guild.set.OverviewMessage(message.guildId, message.id);
		overviewLogger.success('Created new overview message', {
			guildId: message.guildId,
			guildName,
			channelId,
			channelName,
		});
	} catch (error: unknown) {
		if (error instanceof DiscordAPIError) {
			await handleDiscordError(error, { guildId, guildName, channelId, channelName }, options);
		} else if (error instanceof Error) {
			overviewLogger.error(
				`Failed to create message: ${error.message}`,
				{ guildId, guildName, channelId, channelName },
				error,
			);
		} else {
			overviewLogger.error('Unknown error creating message', {
				guildId,
				guildName,
				channelId,
				channelName,
			});
			container.logger.error('Error details:', error);
		}
	}
}

/**
 * Main function to update or create the birthday overview message
 * Features:
 * - Parallel fetching of guild and channel data
 * - Pre-validation before expensive operations
 * - Automatic config cleanup on invalid state
 * - Comprehensive error handling with recovery
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
		overviewLogger.warn(`Guild not found, skipping update`, { guildId });
		return;
	}

	// Validate channel exists and is text-based
	if (!channel?.isTextBased()) {
		overviewLogger.warn('Invalid channel, resetting config', { guildId, guildName: guild.name });
		await resetConfig(guildId, 'Channel is invalid or not text-based');
		return;
	}

	const guildName = guild.name;
	const channelName = 'name' in channel ? channel.name : undefined;

	// Generate birthday embed
	const birthdayEmbed = await generateBirthdayEmbed(guild);

	// Validate embed before sending
	if (!isEmbedValid(birthdayEmbed)) {
		overviewLogger.warn('Empty embed generated, skipping update', { guildId, guildName });
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
