import { container } from '@sapphire/framework';
import { isNullishOrEmpty } from '@sapphire/utilities';
import {
	type APIUser,
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	type EmbedAuthorData,
	GuildChannel,
	GuildMember,
	type ImageURLOptions,
	PermissionFlagsBits,
	Snowflake,
	ThreadChannel,
	User,
	UserResolvable
} from 'discord.js';
import { BrandingColors } from './constants.js';

/**
 * Validates that a user has VIEW_CHANNEL permissions to a channel
 * @param channel The TextChannel to check
 * @param user The user for which to check permission
 * @returns Whether the user has access to the channel
 * @example validateChannelAccess(channel, message.author)
 */
export function validateChannelAccess(channel: GuildChannel | ThreadChannel, user: UserResolvable) {
	return (channel.guild !== null && channel.permissionsFor(user)?.has(PermissionFlagsBits.ViewChannel)) || false;
}

/**
 * Checks whether or not the user uses the new username change, defined by the
 * `discriminator` being `'0'` or in the future, no discriminator at all.
 * @see {@link https://dis.gd/usernames}
 * @param user The user to check.
 */
export function usesPomelo(user: APIUser | User) {
	return isNullishOrEmpty(user.discriminator) || user.discriminator === '0';
}

export function getDisplayAvatar(user: APIUser | User, options?: Readonly<ImageURLOptions>) {
	if (user.avatar === null) {
		const id = usesPomelo(user) ? Number(BigInt(user.id) >> 22n) % 6 : Number(user.discriminator) % 5;
		return container.client.rest.cdn.defaultAvatar(id);
	}

	return container.client.rest.cdn.avatar(user.id, user.avatar, options);
}

export function getTag(user: APIUser | User) {
	return usesPomelo(user) ? `@${user.username}` : `${user.username}#${user.discriminator}`;
}

export function getEmbedAuthor(user: APIUser | User, url?: string | undefined): EmbedAuthorData {
	return { iconURL: getDisplayAvatar(user, { size: 128 }), name: getTag(user), url };
}

export function getFooterAuthor(user: APIUser | User, url?: string | undefined) {
	return { iconURL: getDisplayAvatar(user, { size: 128 }), text: getTag(user), url };
}

/**
 * Splits a message into multiple messages if it exceeds a certain length, using a specified character as the delimiter.
 * @param content The message to split.
 * @param options The options for splitting the message.
 * @returns An array of messages split from the original message.
 * @throws An error if the content cannot be split.
 */
export function splitMessage(content: string, options: SplitMessageOptions) {
	if (content.length <= options.maxLength) return [content];

	let last = 0;
	const messages = [] as string[];
	while (last < content.length) {
		// If the last chunk can fit the rest of the content, push it and break:
		if (content.length - last <= options.maxLength) {
			messages.push(content.slice(last));
			break;
		}

		// Find the last best index to split the chunk:
		const index = content.lastIndexOf(options.char, options.maxLength + last);
		if (index === -1) throw new Error('Unable to split content.');

		messages.push(content.slice(last, index + 1));
		last = index + 1;
	}

	return messages;
}

export interface SplitMessageOptions {
	char: string;
	maxLength: number;
}

/**
 * Checks if the provided user ID is the same as the client's ID.
 *
 * @param userId - The user ID to check.
 */
export function isUserSelf(userId: Snowflake) {
	return userId === process.env.CLIENT_ID;
}

export function getColor(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
	return (interaction.member instanceof GuildMember ? interaction.member.displayColor : interaction.user.accentColor) ?? BrandingColors.Primary;
}
