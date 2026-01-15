import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { isBotAdmin } from '../lib/utils/helper';

/**
 * Ensures the user is a bot administrator
 * @example
 * \\@ApplyOptions<CommandOptions>({
 *   preconditions: ['AdminOnly']
 * })
 */
export class AdminOnlyPrecondition extends Precondition {
	readonly #message = 'This command can only be used by bot administrators.';
	readonly #identifier = 'AdminOnlyPrecondition';

	public override chatInputRun(interaction: CommandInteraction) {
		return this.checkAdminStatus(interaction.user.id);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.checkAdminStatus(interaction.user.id);
	}

	public override messageRun(message: Message) {
		return this.checkAdminStatus(message.author.id);
	}

	private checkAdminStatus(userId: Snowflake) {
		return isBotAdmin(userId) ? this.ok() : this.error({ identifier: this.#identifier, message: this.#message });
	}
}
