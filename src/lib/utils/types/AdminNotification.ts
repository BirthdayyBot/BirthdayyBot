/**
 * Context information passed to admin notification strategies
 *
 * @example
 * ```typescript
 * const context: AdminNotificationContext = {
 *     commandName: 'birthday-set',
 *     userId: '123456789',
 *     guildId: '987654321',
 * };
 * ```
 */
export interface AdminNotificationContext {
	commandName?: string;
	userId?: string;
	guildId?: string;
	taskName?: string;
	[key: string]: unknown;
}
