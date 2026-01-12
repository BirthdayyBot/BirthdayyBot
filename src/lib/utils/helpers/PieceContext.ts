import { Piece } from '@sapphire/pieces';
import type { PieceContext } from './PieceContext';

/**
 * Type alias for Sapphire Piece context
 *
 * Represents the context information extracted from a Sapphire Piece instance
 * (Command, Listener, Precondition, Task, etc.) for better error tracking.
 *
 * @example
 * ```typescript
 * const pieceContext = extractPieceContext(this);
 * container.errorLogger.handle(error, {
 *     interaction,
 *     piece: this  // or pass extracted context
 * });
 * ```
 */
export type { PieceContext } from '@sapphire/pieces';

/**
 * Type guard to check if an object is a Sapphire Piece
 *
 * @param value The value to check
 * @returns True if the value is a Sapphire Piece instance
 *
 * @example
 * ```typescript
 * if (isPiece(this)) {
 *     const context = extractPieceContext(this);
 * }
 * ```
 */
export function isPiece(value: unknown): value is Piece {
	return value instanceof Piece;
}

/**
 * Extract Piece.Context from a Sapphire Piece instance
 *
 * Safely extracts the piece context using the Sapphire Pieces API.
 * Returns undefined if the value is not a valid Sapphire Piece.
 *
 * @param piece The Sapphire Piece (Command, Listener, Precondition, Task, etc.)
 * @returns Piece.Context with store, name, and location information, or undefined if not a valid piece
 *
 * @example
 * ```typescript
 * // In a Command
 * const context = extractPieceContext(this);
 * // { store: Store, name: 'ping', location: Location { ... } }
 *
 * // In a Listener
 * const context = extractPieceContext(this);
 * // { store: Store, name: 'commandError', location: Location { ... } }
 *
 * // Safely extract in any Piece
 * if (isPiece(this)) {
 *     const context = extractPieceContext(this);
 *     // Use context...
 * }
 * ```
 */
export function extractPieceContext(piece: unknown): PieceContext | undefined {
	// Use type guard for better type safety
	if (!isPiece(piece)) {
		return undefined;
	}

	// Return a Piece.Context-like object extracted from the Piece
	return {
		store: piece.store,
		name: piece.name,
		path: piece.location?.full ?? '',
		root: piece.location?.root ?? '',
	};
}

/**
 * Format Piece.Context as a readable string for logging
 *
 * Formats the context as "StoreName:pieceName" (e.g., "Command:ping", "Listener:commandError")
 *
 * @param context The Piece.Context to format
 * @returns Formatted string like "Command:ping" or "Listener:commandError", or undefined if context is falsy
 *
 * @example
 * ```typescript
 * const context = extractPieceContext(this);
 * const formatted = formatPieceContext(context);
 * // "Command:ping"
 * ```
 */
export function formatPieceContext(context: PieceContext | undefined): string | undefined {
	if (!context) return undefined;
	return `${context.store.name}:${context.name}`;
}
