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
	guild_id: string;
	guildName?: string;
	channel_id: string;
	channelName?: string;
	message_id?: string;
}

/**
 * Reset the overview channel configuration
 */
async function resetConfig(guild_id: string, reason: string): Promise<void> {
	await Promise.all([
		container.utilities.guild.reset.OverviewChannel(guild_id),
		container.utilities.guild.reset.OverviewMessage(guild_id),
	]);
	overviewLogger.warn(`Reset overview configuration: ${reason}`, { guild_id });
}

/**
 * Handle Discord API errors with appropriate recovery strategies
 */
async function handleDiscordError(
	error: DiscordAPIError,
	context: MessageContext,
	options: EmbedOptions,
): Promise<void> {
	const { guild_id, channel_id, guildName, channelName } = context;

	// Transient errors - log and skip
	if (isRateLimitError(error)) {
		overviewLogger.warn('Rate limited, will retry later', { guild_id, guildName });
		return;
	}

	// Message not found - recreate it
	if (isMessageNotFoundError(error)) {
		overviewLogger.warn('Message not found, creating new one', { guild_id, guildName, channel_id, channelName });
		await createOverviewMessage(channel_id, options, context);
		return;
	}

	// Configuration issues - reset config
	if (requiresConfigReset(error)) {
		const reason = isChannelInvalidError(error) ? 'Channel no longer exists' : 'Missing permissions';
		await resetConfig(guild_id, reason);
		return;
	}

	// Log other errors with full context
	overviewLogger.error(
		`Discord API error: ${error.message}`,
		{ guild_id, guildName, channel_id, channelName },
		error,
	);

	if (isEmptyMessageError(error)) {
		overviewLogger.error('Empty embed detected', { guild_id, guildName, channel_id, channelName });
		container.logger.error('Embed content:', options.embeds[0]);
	}
}

/**
 * Update an existing overview message
 */
async function updateMessage(message_id: string, options: EmbedOptions, context: MessageContext): Promise<void> {
	const { guild_id, channel_id, guildName, channelName } = context;

	try {
		await editMessage(channel_id, message_id, options);
		overviewLogger.success('Updated overview message', { guild_id, guildName, channel_id, channelName });
	} catch (error: unknown) {
		if (error instanceof DiscordAPIError) {
			await handleDiscordError(error, { ...context, message_id }, options);
		} else if (error instanceof Error) {
			overviewLogger.error(
				`Unexpected error: ${error.message}`,
				{ guild_id, guildName, channel_id, channelName },
				error,
			);
		} else {
			overviewLogger.error('Unknown error type', { guild_id, guildName, channel_id, channelName });
			container.logger.error('Error details:', error);
		}
	}
}

/**
 * Create a new overview message and save its ID
 */
async function createOverviewMessage(
	channel_id: string,
	options: EmbedOptions,
	context: Omit<MessageContext, 'channel_id' | 'message_id'> & { channel_id?: string; channelName?: string },
): Promise<void> {
	const { guild_id, guildName, channelName } = context;

	try {
		const message = await sendMessage(channel_id, options);
		if (!message?.inGuild()) return;

		await container.utilities.guild.set.OverviewMessage(message.guildId, message.id);
		overviewLogger.success('Created new overview message', {
			guild_id: message.guildId,
			guildName,
			channel_id,
			channelName,
		});
	} catch (error: unknown) {
		if (error instanceof DiscordAPIError) {
			await handleDiscordError(error, { guild_id, guildName, channel_id, channelName }, options);
		} else if (error instanceof Error) {
			overviewLogger.error(
				`Failed to create message: ${error.message}`,
				{ guild_id, guildName, channel_id, channelName },
				error,
			);
		} else {
			overviewLogger.error('Unknown error creating message', { guild_id, guildName, channel_id, channelName });
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
export default async function updateBirthdayOverview(guild_id: string): Promise<void> {
	// Early exit if no overview channel configured
	const config = await container.utilities.guild.get.GuildConfig(guild_id);
	if (!config?.overviewChannel) return;

	const { overviewChannel, overviewMessage } = config;

	// Parallel fetch for performance
	const [guild, channel] = await Promise.all([
		container.client.guilds.fetch(guild_id).catch(() => null),
		container.client.channels.fetch(overviewChannel).catch(() => null),
	]);

	// Validate guild exists
	if (!guild) {
		overviewLogger.warn(`Guild not found, skipping update`, { guild_id });
		return;
	}

	// Validate channel exists and is text-based
	if (!channel?.isTextBased()) {
		overviewLogger.warn('Invalid channel, resetting config', { guild_id, guildName: guild.name });
		await resetConfig(guild_id, 'Channel is invalid or not text-based');
		return;
	}

	const guildName = guild.name;
	const channelName = 'name' in channel ? channel.name : undefined;

	// Generate birthday embed
	const birthdayEmbed = await generateBirthdayEmbed(guild);

	// Validate embed before sending
	if (!isEmbedValid(birthdayEmbed)) {
		overviewLogger.warn('Empty embed generated, skipping update', { guild_id, guildName });
		return;
	}

	const options: EmbedOptions = { embeds: [birthdayEmbed] };
	const context: MessageContext = { guild_id, guildName, channel_id: overviewChannel, channelName };

	// Update or create message
	if (overviewMessage) {
		await updateMessage(overviewMessage, options, context);
	} else {
		await createOverviewMessage(overviewChannel, options, { guild_id, guildName, channelName });
	}
}
