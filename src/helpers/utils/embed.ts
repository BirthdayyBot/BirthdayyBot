import type { APIEmbed } from 'discord.js';

/**
 * Validate if an embed has content
 * An embed is valid if it has at least a title, description, or fields
 *
 * This utility is shared across the codebase to ensure consistent embed validation
 * Used in:
 * - Birthday overview updates (prevents empty message errors)
 * - Birthday list generation (validates generated embeds)
 *
 * @param embed - The embed to validate
 * @returns true if the embed has content, false otherwise
 */
export function isEmbedValid(embed: APIEmbed): boolean {
	return Boolean(embed.title || embed.description || (embed.fields && embed.fields.length > 0));
}
