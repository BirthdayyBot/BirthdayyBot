import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { BOT_OWNER } from '../helpers/provide/environment';

/**
 * Ensures the user is the bot owner
 * @example
 * \\@ApplyOptions<CommandOptions>({
 *   preconditions: ['BotOwnerOnly']
 * })
 */
export class BotOwnerOnlyPrecondition extends Precondition {
	readonly #message = 'This command can only be used by the bot owner.';
	readonly #identifier = 'BotOwnerOnlyPrecondition';

	public override chatInputRun(interaction: CommandInteraction) {
		return this.checkOwnerStatus(interaction.user.id);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.checkOwnerStatus(interaction.user.id);
	}

	public override messageRun(message: Message) {
		return this.checkOwnerStatus(message.author.id);
	}

	private checkOwnerStatus(userId: Snowflake) {
		return BOT_OWNER.includes(userId)
			? this.ok()
			: this.error({ identifier: this.#identifier, message: this.#message });
	}
}
