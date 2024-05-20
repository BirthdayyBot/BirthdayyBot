import { generateBirthdayList } from '#utils/birthday';
import { type Guild as Settings } from '@prisma/client';
import { container, Result } from '@sapphire/framework';
import { Message, PermissionFlagsBits, TextChannel, type Guild } from 'discord.js';

export class OverviewManager {
	public readonly guild: Guild;

	/**
	 * Constructs an OverviewManager instance.
	 * @param guild - The guild where the overview message is managed.
	 */
	public constructor(guild: Guild) {
		this.guild = guild;
	}

	/**
	 * Sends the overview message to the specified channel.
	 * Fetches the channel, checks permissions, then sends the message.
	 * @returns A Promise that resolves to void when the message is sent or null if sending fails.
	 */
	public async send(): Promise<void> {
		const channel = await this.#getChannel();
		if (!channel) return;

		const canAccess = await this.#canAccessChannel(channel);
		if (!canAccess) return;

		const message = await this.#createMessage(channel);
		await message.edit(await this.#createMessageOptions());
	}

	/**
	 * Edits the overview message in the specified channel.
	 * Fetch the message by ID, or creates a new one if not found, then updates it with new content.
	 * @returns A Promise that resolves to void.
	 */
	public async edit(): Promise<void> {
		const channel = await this.#getChannel();
		if (!channel) return;

		const canAccess = await this.#canAccessChannel(channel);
		if (!canAccess) return;

		const { overviewMessage } = await container.prisma.guild.findUniqueOrThrow({
			where: { guildId: this.guild.id },
			select: { overviewMessage: true }
		});

		const message = await this.#fetchMessage(channel, overviewMessage);

		if (message) {
			await message.edit(await this.#createMessageOptions());
		} else {
			const newMessage = await this.#createMessage(channel);
			await newMessage.edit(await this.#createMessageOptions());
		}
	}

	/**
	 * Deletes the overview message in the specified channel.
	 * @returns A Promise that resolves to void.
	 */
	public async delete(): Promise<void> {
		const channel = await this.#getChannel();
		if (!channel) return;

		const canAccess = await this.#canAccessChannel(channel);
		if (!canAccess) return;

		const { overviewMessage } = await container.prisma.guild.findUniqueOrThrow({
			where: { guildId: this.guild.id },
			select: { overviewMessage: true }
		});

		const message = await this.#fetchMessage(channel, overviewMessage);
		if (message) await message.delete();

		await container.prisma.guild.update({
			where: { guildId: this.guild.id },
			data: { overviewMessage: null }
		});
	}

	public async setChannel(channelId: string): Promise<Settings | null> {
		const channel = this.guild.channels.cache.get(channelId);
		if (!channel) return null;

		if (!channel.isTextBased()) return null;

		return container.prisma.guild.update({
			where: { guildId: this.guild.id },
			data: { overviewChannel: channelId }
		});
	}

	/**
	 * Retrieves the text channel for the overview message.
	 * @returns A Promise that resolves to the TextChannel if found and valid, otherwise null.
	 */
	async #getChannel(): Promise<TextChannel | null> {
		const { overviewChannel } = await container.prisma.guild.findUniqueOrThrow({
			where: { guildId: this.guild.id },
			select: { overviewChannel: true }
		});

		if (!overviewChannel) return null;

		const channel = this.guild.channels.cache.get(overviewChannel);
		if (channel?.isTextBased()) return channel as TextChannel;

		return null;
	}

	/**
	 * Checks if the bot has the required permissions to access a given text channel.
	 * @param channel - The text channel to check.
	 * @returns A Promise that resolves to a boolean indicating whether the bot has the required permissions.
	 */
	async #canAccessChannel(channel: TextChannel): Promise<boolean> {
		const requiredPermissions = [
			PermissionFlagsBits.SendMessages,
			PermissionFlagsBits.EmbedLinks,
			PermissionFlagsBits.ViewChannel
		];
		const me = await this.guild.members.fetchMe();
		const permissions = channel.permissionsFor(me);

		if (!permissions) return false;

		const missingPermissions = permissions.missing(requiredPermissions);
		return missingPermissions.length === 0;
	}

	/**
	 * Fetches a message from the specified channel by its ID.
	 * @param channel - The text channel to fetch the message from.
	 * @param messageId - The ID of the message to fetch. If null, the method returns null.
	 * @returns A Promise that resolves to the fetched message, or null if the message could not be fetched.
	 */
	async #fetchMessage(channel: TextChannel, messageId: string | null): Promise<Message | null> {
		if (!messageId) return null;

		const result = await Result.fromAsync(() => channel.messages.fetch(messageId));
		return result.match({
			ok: (message) => message,
			err: () => this.#handleGetMessageError(channel)
		});
	}

	/**
	 * Handles errors when fetching a message fails.
	 * @param channel - The text channel to send the fallback message to.
	 * @returns A Promise that resolves to the newly sent message, or null if sending fails.
	 */
	async #handleGetMessageError(channel: TextChannel): Promise<Message | null> {
		try {
			return await channel.send('Loading...');
		} catch {
			return null;
		}
	}

	/**
	 * Creates a new overview message in the specified channel.
	 * @param channel - The text channel to create the message in.
	 * @returns A Promise that resolves to the newly created message.
	 */
	async #createMessage(channel: TextChannel): Promise<Message> {
		const message = await channel.send('Loading...');
		await this.#updateSettings(message);
		return message;
	}

	/**
	 * Updates the settings to store the ID of the overview message.
	 * @param message - The newly created message whose ID will be stored.
	 * @returns A Promise that resolves to the updated settings.
	 */
	async #updateSettings(message: Message): Promise<Settings> {
		return container.prisma.guild.update({
			where: { guildId: this.guild.id },
			data: { overviewMessage: message.id }
		});
	}

	/**
	 * Creates the message options for the overview message, including embeds and components.
	 * @returns A Promise that resolves to an object containing the message options.
	 */
	async #createMessageOptions(): Promise<{ embeds: any[]; components: any[] }> {
		const birthdayList = await generateBirthdayList(1, this.guild);
		return { embeds: [birthdayList.embed], components: birthdayList.components };
	}
}
