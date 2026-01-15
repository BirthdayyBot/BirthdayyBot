import type { APIEmbed, ColorResolvable } from 'discord.js';
import { codeBlock } from '@sapphire/utilities';
import type { BaseError } from '../errors/index';
import { isBaseError } from '../errors/index';
import { generateDefaultEmbed } from './embed';
import { isDevelopment } from './env';

/**
 * Options for configuring the ErrorFormatter
 *
 * @example
 * ```typescript
 * const formatter = new ErrorFormatter({
 *     showStackInProduction: false,
 *     maxStackLength: 1024,
 *     errorColor: 0xFF6B6B,
 *     contextColor: 0x4ECDC4
 * });
 * ```
 */
export interface ErrorFormatterOptions {
	/**
	 * Whether to show stack traces in production (default: false)
	 */
	showStackInProduction?: boolean;

	/**
	 * Maximum length of stack trace to display (default: 1024)
	 */
	maxStackLength?: number;

	/**
	 * Maximum length of context data (default: 1024)
	 */
	maxContextLength?: number;

	/**
	 * Color for error embeds (default: Discord default red)
	 */
	errorColor?: ColorResolvable;

	/**
	 * Whether to include context by default (default: true)
	 */
	includeContextByDefault?: boolean;

	/**
	 * Custom error title formatter
	 */
	formatTitle?: (error: Error | BaseError) => string;

	/**
	 * Custom error description formatter
	 */
	formatDescription?: (error: Error | BaseError) => string;
}

/**
 * Formats errors into Discord embeds for display to users or admins.
 *
 * Responsible for creating consistent, formatted error messages that
 * are displayed as Discord embeds. Handles user-friendly messages,
 * technical details, and contextual information based on the error type
 * and display mode.
 *
 * @example
 * ```typescript
 * // Create formatter with custom options
 * const formatter = new ErrorFormatter({
 *     showStackInProduction: false,
 *     maxStackLength: 1024
 * });
 *
 * // Build embeds
 * const userEmbed = formatter.buildErrorEmbed(error);
 * const adminEmbed = formatter.buildErrorEmbed(error, true, true);
 *
 * // Add custom context
 * formatter.addContextToEmbed(adminEmbed, {
 *     operation: 'birthday-update',
 *     userId: '12345'
 * });
 * ```
 */
export class ErrorFormatter {
	private readonly options: Required<ErrorFormatterOptions>;

	/**
	 * Create a new ErrorFormatter instance
	 *
	 * @param options Configuration options
	 */
	public constructor(options: ErrorFormatterOptions = {}) {
		this.options = {
			showStackInProduction: options.showStackInProduction ?? false,
			maxStackLength: options.maxStackLength ?? 1024,
			maxContextLength: options.maxContextLength ?? 1024,
			errorColor: options.errorColor ?? 0xf04747, // Discord default error red
			includeContextByDefault: options.includeContextByDefault ?? true,
			formatTitle: options.formatTitle ?? ((error) => this.defaultFormatTitle(error)),
			formatDescription: options.formatDescription ?? ((error) => this.defaultFormatDescription(error)),
		};
	}

	/**
	 * Build a formatted error embed for Discord.
	 *
	 * Creates a Discord embed that displays the error in a user-friendly
	 * way. Includes technical details (stack trace, context) only when
	 * requested and appropriate.
	 *
	 * @param error The error to format
	 * @param showStack Whether to include stack trace
	 * @param includeContext Whether to include error context information
	 * @returns Formatted APIEmbed ready to send to Discord
	 *
	 * @example
	 * ```typescript
	 * // User-friendly embed
	 * const userEmbed = formatter.buildErrorEmbed(error);
	 *
	 * // With technical details for debugging
	 * const adminEmbed = formatter.buildErrorEmbed(error, true, true);
	 * ```
	 */
	public buildErrorEmbed(
		error: Error | BaseError,
		showStack = false,
		includeContext = this.options.includeContextByDefault,
	): APIEmbed {
		const title = this.options.formatTitle(error);
		const description = this.options.formatDescription(error);

		const embed = generateDefaultEmbed({
			title,
			description,
		});

		// Set error color
		embed.color = typeof this.options.errorColor === 'number' ? this.options.errorColor : 0xf04747;

		const fields: APIEmbed['fields'] = [];

		// Add technical details if appropriate
		if (this.shouldShowStack(showStack) && error.stack) {
			fields.push({
				name: 'Stack Trace',
				value: codeBlock('', error.stack.slice(0, this.options.maxStackLength)),
				inline: false,
			});
		}

		// Add context if available and requested
		if (includeContext && isBaseError(error) && Object.keys(error.context).length > 0) {
			fields.push({
				name: 'Context',
				value: codeBlock(
					'json',
					JSON.stringify(error.context, null, 2).slice(0, this.options.maxContextLength),
				),
				inline: false,
			});
		}

		if (fields.length > 0) {
			embed.fields = fields;
		}

		return embed;
	}

	/**
	 * Add contextual fields to an existing embed.
	 *
	 * Appends a formatted context field to the embed that displays
	 * key-value pairs useful for debugging. Context values are
	 * truncated to respect Discord embed limits.
	 *
	 * @param embed The embed to add context to
	 * @param context Object with context key-value pairs to add
	 *
	 * @example
	 * ```typescript
	 * const embed = formatter.buildErrorEmbed(error);
	 * formatter.addContextToEmbed(embed, {
	 *     operation: 'updateBirthday',
	 *     userId: '12345',
	 *     timestamp: new Date().toISOString()
	 * });
	 * ```
	 */
	public addContextToEmbed(embed: APIEmbed, context?: Record<string, string | undefined>): void {
		if (!context) return;

		const contextStr = Object.entries(context)
			.filter(([, v]) => v !== undefined)
			.map(([k, v]) => `${k}: ${v ?? ''}`)
			.join('\n');

		if (!contextStr) return;

		embed.fields ??= [];

		embed.fields.push({
			name: 'Context',
			value: codeBlock('', contextStr.slice(0, this.options.maxContextLength)),
			inline: false,
		});
	}

	/**
	 * Update formatter options at runtime
	 *
	 * @param options Partial options to update
	 *
	 * @example
	 * ```typescript
	 * // Temporarily show stack traces in production
	 * formatter.updateOptions({ showStackInProduction: true });
	 * ```
	 */
	public updateOptions(options: Partial<ErrorFormatterOptions>): void {
		Object.assign(this.options, options);
	}

	/**
	 * Get current formatter options
	 *
	 * @returns Current configuration options
	 */
	public getOptions(): Readonly<ErrorFormatterOptions> {
		return Object.freeze({ ...this.options });
	}

	/**
	 * Default title formatter
	 *
	 * @private
	 */
	private defaultFormatTitle(error: Error | BaseError): string {
		if (isBaseError(error)) {
			return `Error (${error.code})`;
		}
		return 'An Error Occurred';
	}

	/**
	 * Default description formatter
	 *
	 * @private
	 */
	private defaultFormatDescription(error: Error | BaseError): string {
		if (isBaseError(error) && error.shouldShowToUser) {
			return error.getUserMessage();
		}
		return 'An unexpected error occurred. Our team has been notified.';
	}

	/**
	 * Check if stack trace should be shown
	 *
	 * @private
	 */
	private shouldShowStack(showStack: boolean): boolean {
		if (!showStack) return false;
		return isDevelopment || this.options.showStackInProduction;
	}
}
